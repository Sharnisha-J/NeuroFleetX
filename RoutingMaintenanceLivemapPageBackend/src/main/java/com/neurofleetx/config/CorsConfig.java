package com.neurofleetx.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Value("${app.cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS}")
    private String[] allowedMethods;

    @Value("${app.cors.allowed-headers:*}")
    private String[] allowedHeaders;

    @Value("${app.cors.allow-credentials:true}")
    private boolean allowCredentials;

    @Value("${app.cors.max-age:3600}")
    private long maxAge;

    @Bean
    public WebMvcConfigurer corsConfigurer() {

        // Log CORS configuration at startup (useful for debugging)
        System.out.println("CORS Allowed Origins: " + Arrays.toString(allowedOrigins));

        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {

                // Secured API endpoints
                registry.addMapping("/api/**")
                        .allowedOrigins(allowedOrigins)
                        .allowedMethods(allowedMethods)
                        .allowedHeaders(allowedHeaders)
                        .allowCredentials(allowCredentials)
                        .maxAge(maxAge);

                // Public endpoints (health, status, docs)
                registry.addMapping("/public/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET")
                        .maxAge(1800);
            }
        };
    }
}
