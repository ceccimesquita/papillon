package br.com.papillon.eventos.common;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // aplica para todos os endpoints
                .allowedOrigins("http://localhost:3000") // origem permitida
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // métodos HTTP permitidos
                .allowedHeaders("*") // permite qualquer header
                .allowCredentials(true); // permite envio de cookies/autenticação
    }
}
