package org.alantitor.service;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "ping")
@Getter
@Setter
public class PingServiceConfig {
    private int timeout;
}
