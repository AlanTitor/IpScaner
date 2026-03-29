package org.alantitor.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${cors.frontUrl}")
    private String frontUrl;

    public void addCorsMappings(CorsRegistry corsRegistry){
        System.out.println(frontUrl);
        corsRegistry.addMapping("/api/**")
                .allowedOrigins(frontUrl)
                .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
