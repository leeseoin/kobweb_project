package com.kob_backend_seoin.kob_backend.repository.neo4j;

import com.kob_backend_seoin.kob_backend.domain.neo4j.Person;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonRepository extends Neo4jRepository<Person, Long> {

    Optional<Person> findByUserId(String userId);

    @Query("MATCH (p:Person {userId: $userId})-[:FRIEND_OF]->(friend:Person) RETURN friend")
    List<Person> findFriendsByUserId(String userId);

    @Query("MATCH (p1:Person {userId: $userId1}), (p2:Person {userId: $userId2}) " +
           "CREATE (p1)-[:FRIEND_OF]->(p2), (p2)-[:FRIEND_OF]->(p1)")
    void createFriendship(String userId1, String userId2);

    @Query("MATCH (p1:Person {userId: $userId1})-[r:FRIEND_OF]-(p2:Person {userId: $userId2}) DELETE r")
    void deleteFriendship(String userId1, String userId2);

    @Query("MATCH (p:Person {userId: $userId})-[:FRIEND_OF*1..2]-(friend:Person) " +
           "RETURN DISTINCT friend, SIZE((friend)-[:FRIEND_OF]-()) as mutualFriends " +
           "ORDER BY mutualFriends DESC LIMIT 20")
    List<Person> findRecommendedFriends(String userId);

    @Query("MATCH (p:Person {userId: $userId})-[:FRIEND_OF*1..3]-(connected:Person) " +
           "RETURN connected, length(shortestPath((p)-[:FRIEND_OF*]-(connected))) as distance " +
           "ORDER BY distance")
    List<Person> findNetworkConnections(String userId);
}