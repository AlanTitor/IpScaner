package org.alantitor.service;

import lombok.AllArgsConstructor;
import org.alantitor.entity.Node;
import org.alantitor.repository.NodeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.InetAddress;
import java.util.List;

@Service
@AllArgsConstructor
public class PingService {

    private NodeRepository nodeRepository;
    //@Value("${ping.timeout}")
    private final int PING_TIMEOUT = 500;

    public void pingIp() throws IOException {
        List<Node> nodes = nodeRepository.getAllNode();

        for(Node node : nodes){
            boolean reachable = InetAddress.getByName(node.getIp()).isReachable(PING_TIMEOUT);

            if(reachable != node.getIsUp()){
                node.setIsUp(reachable);
                nodeRepository.save(node);
            }
        }
    }
}
