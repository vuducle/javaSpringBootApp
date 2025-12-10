package org.example.springboot.repository.specification;

import jakarta.persistence.criteria.Predicate;
import org.example.springboot.model.User;
import org.example.springboot.model.enums.ERole;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    public static Specification<User> searchByTerm(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.isBlank()) {
                return criteriaBuilder.conjunction();
            }

            String lowerCaseSearchTerm = searchTerm.toLowerCase();
            String likePattern = "%" + lowerCaseSearchTerm + "%";

            Predicate usernamePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), likePattern);
            Predicate namePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern);

            return criteriaBuilder.or(usernamePredicate, namePredicate);
        };
    }

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
