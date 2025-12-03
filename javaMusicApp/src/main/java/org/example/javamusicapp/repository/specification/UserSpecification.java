package org.example.javamusicapp.repository.specification;

import org.example.javamusicapp.model.User;
import org.example.javamusicapp.model.enums.ERole;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    public static Specification<User> hasTeam(String team) {
        return (root, query, criteriaBuilder) -> 
            team == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("team"), team);
    }

    public static Specification<User> hasAusbildungsjahr(Integer ausbildungsjahr) {
        return (root, query, criteriaBuilder) -> 
            ausbildungsjahr == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("ausbildungsjahr"), ausbildungsjahr);
    }

    public static Specification<User> hasRole(String rolle) {
        return (root, query, criteriaBuilder) -> {
            if (rolle == null || rolle.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            try {
                String roleName = rolle.toUpperCase();
                if (!roleName.startsWith("ROLE_")) {
                    roleName = "ROLE_" + roleName;
                }
                ERole eRole = ERole.valueOf(roleName);
                // Join the roles table and compare the name
                return criteriaBuilder.equal(root.join("roles").get("name"), eRole);
            } catch (IllegalArgumentException e) {
                // If the role string is invalid, return a predicate that matches no records
                return criteriaBuilder.disjunction();
            }
        };
    }
}
