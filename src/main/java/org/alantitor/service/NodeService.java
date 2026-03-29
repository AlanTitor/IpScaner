package org.alantitor.service;

import lombok.AllArgsConstructor;
import org.alantitor.dto.NodeDto;
import org.alantitor.entity.Node;
import org.alantitor.mapper.NodeMapper;
import org.alantitor.repository.NodeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class NodeService {

    private NodeRepository nodeRepository;
    private NodeMapper nodeMapper;

    public List<NodeDto> getAllNodes(){
        List<Node> nodes = nodeRepository.getAllNode();
        return nodes.stream().map(nodeMapper::toDto).toList();
    }

    public Long addNode(NodeDto nodeDtoRequest){
        Node node = nodeMapper.toEntity(nodeDtoRequest);
        nodeRepository.save(node);
        return node.getId();
    }

    public void changeNodeById(Long id, NodeDto nodeDto){
        Node node = nodeRepository.findById(id).orElseThrow(() -> new RuntimeException("Node not found with id:" + id));
        node.setIp(nodeDto.getIp());
        node.setType(nodeDto.getType());
        node.setTag(nodeDto.getTag());
        nodeRepository.save(node);
    }

    public void deleteNodeById(Long id){
        Node node = nodeRepository.findById(id).orElseThrow(() -> new RuntimeException("Node not found with id:" + id));
        nodeRepository.delete(node);
    }
}
