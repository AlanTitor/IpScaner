package org.alantitor.repository;

import org.alantitor.entity.Node;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface NodeRepository extends CrudRepository<Node, Long> {
    @Query("SELECT n FROM Node n")
    List<Node> getAllNode();
}
