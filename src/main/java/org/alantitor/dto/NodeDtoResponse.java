package org.alantitor.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.alantitor.types.NodeType;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class NodeDtoResponse {
    private String ip;
    private NodeType type;
    private Boolean isUp;
    private String tag;
}
