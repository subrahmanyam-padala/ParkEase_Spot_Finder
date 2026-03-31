package com.parkeasy.ParkEase_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class CorsConfig {

	@Value("${app.cors.allowed-origin-patterns:http://localhost:*,https://localhost:*}")
	private String allowedOriginPatterns;

	@Bean
	public CorsFilter corsFilter() {

		CorsConfiguration config = new CorsConfiguration();

		// Allow origins from environment-configurable list
		config.setAllowedOriginPatterns(Arrays.stream(allowedOriginPatterns.split(","))
				.map(String::trim)
				.filter(s -> !s.isEmpty())
				.collect(Collectors.toList()));

		// Allow HTTP/S methods
		config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

		// Allow headers
		config.setAllowedHeaders(Arrays.asList("*"));

		// Allow credentials (JWT, cookies etc.)
		config.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);

		return new CorsFilter(source);
	}
}