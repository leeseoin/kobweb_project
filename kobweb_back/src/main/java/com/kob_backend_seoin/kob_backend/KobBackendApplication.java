package com.kob_backend_seoin.kob_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.cache.CacheAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;

@SpringBootApplication(
    exclude = {
        RedisAutoConfiguration.class,
        CacheAutoConfiguration.class,
        RedisRepositoriesAutoConfiguration.class
    }
)
public class KobBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(KobBackendApplication.class, args);
	}

}
