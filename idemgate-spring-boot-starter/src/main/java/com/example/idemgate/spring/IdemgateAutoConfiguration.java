package com.example.idemgate.spring;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

import com.example.idemgate.client.IdemgateClient;

import tools.jackson.databind.ObjectMapper;

@AutoConfiguration
@ConditionalOnWebApplication
@EnableAspectJAutoProxy
@EnableConfigurationProperties(IdemgateClientProperties.class)
public class IdemgateAutoConfiguration {

	@Bean
	@ConditionalOnMissingBean
	IdemgateClient idemgateClient(IdemgateClientProperties properties) {
		return new IdemgateClient(properties.getBaseUrl(), properties.getApiKey());
	}

	@Bean
	IdempotentAspect idempotentAspect(IdemgateClient client, IdemgateClientProperties properties,
			ObjectMapper objectMapper) {
		return new IdempotentAspect(client, properties, objectMapper);
	}

	@Bean
	IdempotentExceptionHandler idempotentExceptionHandler() {
		return new IdempotentExceptionHandler();
	}
}
