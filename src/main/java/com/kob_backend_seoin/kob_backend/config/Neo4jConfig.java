package com.kob_backend_seoin.kob_backend.config;

import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.data.neo4j.config.AbstractNeo4jConfig;
import org.springframework.data.neo4j.core.transaction.Neo4jTransactionManager;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@EnableNeo4jRepositories(
    basePackages = "com.kob_backend_seoin.kob_backend.repository.neo4j",
    transactionManagerRef = "neo4jTransactionManager"
)
public class Neo4jConfig extends AbstractNeo4jConfig {

    @Value("${spring.neo4j.uri}")
    private String uri;

    @Value("${spring.neo4j.authentication.username}")
    private String username;

    @Value("${spring.neo4j.authentication.password}")
    private String password;

    @Override
    public Driver driver() {
        return GraphDatabase.driver(uri, AuthTokens.basic(username, password));
    }

    @Bean(name = "neo4jTransactionManager")
    @Override
    public PlatformTransactionManager transactionManager(Driver driver, org.springframework.data.neo4j.core.DatabaseSelectionProvider databaseSelectionProvider) {
        return new Neo4jTransactionManager(driver, databaseSelectionProvider);
    }
}