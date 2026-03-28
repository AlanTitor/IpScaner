package org.alantitor.mapper;

import org.alantitor.dto.NodeDto;
import org.alantitor.entity.Node;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NodeMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isUp", ignore = true)
    Node toEntity(NodeDto nodeDtoRequest);
    NodeDto toDto(Node node);
}
