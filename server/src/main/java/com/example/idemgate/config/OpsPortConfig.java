package com.example.idemgate.config;

import org.apache.catalina.connector.Connector;
import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Opens a dedicated ops/management HTTP port (default {@code 15672}, RabbitMQ-style)
 * alongside the main API port ({@code 8080}).
 */
@Configuration
public class OpsPortConfig {

	@Bean
	WebServerFactoryCustomizer<TomcatServletWebServerFactory> opsPortConnector(IdemgateProperties properties) {
		return factory -> {
			int opsPort = properties.getOpsPort();
			if (opsPort <= 0) {
				return;
			}
			Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
			connector.setScheme("http");
			connector.setPort(opsPort);
			factory.addAdditionalConnectors(connector);
		};
	}
}
