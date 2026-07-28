package com.seal.hackathon.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

/**
 * {@code @WebMvcTest} slices do not load the application's main {@code SecurityConfig}, so
 * {@code @PreAuthorize} annotations are inert by default. Importing this small config into a
 * {@code @WebMvcTest} enables method security AOP so controller-level {@code @PreAuthorize}
 * checks are actually exercised.
 */
@TestConfiguration
@EnableMethodSecurity
public class MethodSecurityTestConfig {
}
