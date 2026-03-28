package com.parkeasy.ParkEase_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {

        CorsConfiguration config = new CorsConfiguration();

        // Allow React frontend from localhost and LAN IPs (for mobile access)
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:*", "https://localhost:*",
                "http://10.*:*", "https://10.*:*",
                "http://192.168.*:*", "https://192.168.*:*"));

        // Allow HTTP methods
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