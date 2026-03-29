package org.alantitor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.alantitor.types.NodeType;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "node")
public class Node {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ip", unique = true)
    private String ip;

    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private NodeType type;

    @Column(name = "status", nullable = false)
    private Boolean isUp = false;

    @Column(unique = false, nullable = true)
    private String tag;
}