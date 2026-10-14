package com.example.idemgate.config;

import java.time.Clock;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableConfigurationProperties(IdemgateProperties.class)
@EnableScheduling
public class AppConfig {

	@Bean
	Clock clock() {
		return Clock.systemUTC();
	}
}
