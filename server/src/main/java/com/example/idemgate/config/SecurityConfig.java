package com.example.idemgate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http, IdemgateProperties properties) throws Exception {
		http.csrf(csrf -> csrf.disable())
				.cors(Customizer.withDefaults())
				.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()
						.requestMatchers("/actuator/**").permitAll()
						.requestMatchers("/v1/**").authenticated()
						.anyRequest().permitAll())
				.httpBasic(basic -> basic.disable())
				.formLogin(form -> form.disable())
				.addFilterBefore(
						new ApiKeyAuthFilter(properties.getApiKey(), properties.getOpsUsername(),
								properties.getOpsPassword()),
						UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}
}
