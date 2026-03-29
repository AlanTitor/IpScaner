package org.alantitor.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.alantitor.types.NodeType;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class NodeDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    private String ip;
    private NodeType type;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Boolean isUp;
    private String tag;
}
