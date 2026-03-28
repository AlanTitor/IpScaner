package org.alantitor.scheduler;

import lombok.AllArgsConstructor;
import org.alantitor.service.PingService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@AllArgsConstructor
public class PingScheduler {
    private PingService pingService;

    @Async
    @Scheduled(fixedDelay = 10000)
    public void runPing() throws IOException, InterruptedException {
        pingService.pingIp();
    }
}
