package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.domain.BusinessCard;
import com.kob_backend_seoin.kob_backend.domain.neo4j.Person;
import com.kob_backend_seoin.kob_backend.dto.Network.*;
import com.kob_backend_seoin.kob_backend.repository.BusinessCardRepository;
import com.kob_backend_seoin.kob_backend.repository.neo4j.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class NetworkService {
    private final PersonRepository personRepository;
    private final BusinessCardRepository businessCardRepository;

    @Autowired
    public NetworkService(PersonRepository personRepository, BusinessCardRepository businessCardRepository) {
        this.personRepository = personRepository;
        this.businessCardRepository = businessCardRepository;
    }

    public void createPersonFromBusinessCard(UUID userId, String name, String email, String company, String position) {
        Optional<Person> existingPerson = personRepository.findByUserId(userId.toString());
        if (existingPerson.isEmpty()) {
            Person person = new Person(userId.toString(), name, email, company, position);
            personRepository.save(person);
        }
    }

    public void addFriendConnection(UUID userId, UUID friendUserId) {
        personRepository.createFriendship(userId.toString(), friendUserId.toString());
    }

    public void removeFriendConnection(UUID userId, UUID friendUserId) {
        personRepository.deleteFriendship(userId.toString(), friendUserId.toString());
    }

    public NetworkResponseDto getUserNetwork(UUID userId) {
        List<Person> networkConnections = personRepository.findNetworkConnections(userId.toString());
        List<Person> directFriends = personRepository.findFriendsByUserId(userId.toString());

        List<NetworkNodeDto> nodes = new ArrayList<>();
        List<NetworkConnectionDto> connections = new ArrayList<>();

        Set<String> processedUserIds = new HashSet<>();

        for (Person person : networkConnections) {
            if (!processedUserIds.contains(person.getUserId())) {
                NetworkNodeDto node = createNetworkNodeDto(person);
                nodes.add(node);
                processedUserIds.add(person.getUserId());
            }
        }

        for (Person friend : directFriends) {
            connections.add(new NetworkConnectionDto(userId.toString(), friend.getUserId(), "FRIEND_OF"));
        }

        NetworkStatsDto stats = new NetworkStatsDto(
            networkConnections.size(),
            directFriends.size(),
            calculateMutualConnections(userId, directFriends)
        );

        return new NetworkResponseDto(nodes, connections, stats);
    }

    public List<NetworkNodeDto> getRecommendedConnections(UUID userId) {
        List<Person> recommended = personRepository.findRecommendedFriends(userId.toString());
        return recommended.stream()
                .map(this::createNetworkNodeDto)
                .collect(Collectors.toList());
    }

    private NetworkNodeDto createNetworkNodeDto(Person person) {
        List<BusinessCard> cards = businessCardRepository.findByUserId(UUID.fromString(person.getUserId()));
        List<String> skills = new ArrayList<>();

        if (!cards.isEmpty()) {
            BusinessCard latestCard = cards.get(0);
            skills = latestCard.getSkills() != null ? latestCard.getSkills() : new ArrayList<>();
        }

        return new NetworkNodeDto(
            person.getUserId(),
            person.getName(),
            person.getEmail(),
            person.getCompany(),
            person.getPosition(),
            skills,
            1
        );
    }

    private int calculateMutualConnections(UUID userId, List<Person> friends) {
        int mutualCount = 0;
        for (Person friend : friends) {
            List<Person> friendsOfFriend = personRepository.findFriendsByUserId(friend.getUserId());
            for (Person mutualFriend : friendsOfFriend) {
                if (!mutualFriend.getUserId().equals(userId.toString()) &&
                    friends.stream().anyMatch(f -> f.getUserId().equals(mutualFriend.getUserId()))) {
                    mutualCount++;
                }
            }
        }
        return mutualCount / 2;
    }
}