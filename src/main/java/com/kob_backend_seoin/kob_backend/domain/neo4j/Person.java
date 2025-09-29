package com.kob_backend_seoin.kob_backend.domain.neo4j;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Node("Person")
public class Person {
    @Id
    @GeneratedValue
    private Long id;

    private String userId;
    private String name;
    private String email;
    private String company;
    private String position;

    // Person node = 사용자를 나타냄
    // FRIEND_OF 관계 = 친구 관계를 나타냄
    @Relationship(type = "FRIEND_OF", direction = Relationship.Direction.OUTGOING)
    private Set<Person> friends = new HashSet<>();

    public Person() {}

    public Person(String userId, String name, String email, String company, String position) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.company = company;
        this.position = position;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public Set<Person> getFriends() { return friends; }
    public void setFriends(Set<Person> friends) { this.friends = friends; }

    public void addFriend(Person friend) {
        this.friends.add(friend);
    }
}