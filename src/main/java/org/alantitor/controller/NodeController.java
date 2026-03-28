package org.alantitor.controller;

import lombok.AllArgsConstructor;
import org.alantitor.dto.NodeDto;
import org.alantitor.service.NodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/node")
@AllArgsConstructor
public class NodeController {

    private NodeService nodeService;

    @GetMapping
    public ResponseEntity<List<NodeDto>> getAllNodes(){
        List<NodeDto> dto = nodeService.getAllNodes();
        return ResponseEntity.ok().body(dto);
    }

    @PostMapping
    public ResponseEntity<URI> addNode(@RequestBody NodeDto nodeDtoRequest){
        Long id = nodeService.addNode(nodeDtoRequest);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(id)
                .toUri();
        return ResponseEntity.created(uri).build();
    }

}
