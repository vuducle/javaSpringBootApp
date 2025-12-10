package org.example.springboot.repository.specification;

import org.example.springboot.model.Nachweis;
import org.springframework.data.jpa.domain.Specification;
import java.util.UUID;

public class NachweisSpecification {

    public static Specification<Nachweis> hasStatus(org.example.springboot.model.enums.EStatus status) {
        return (root, query, criteriaBuilder) ->
            status == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<Nachweis> hasAusbilderId(UUID ausbilderId) {
        return (root, query, criteriaBuilder) ->
            ausbilderId == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("ausbilder").get("id"), ausbilderId);
    }
}
