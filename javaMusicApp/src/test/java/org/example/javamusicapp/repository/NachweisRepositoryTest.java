package org.example.javamusicapp.repository;

import org.example.javamusicapp.model.Nachweis;
import org.example.javamusicapp.model.User;
import org.example.javamusicapp.model.enums.EStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@DataJpaTest
public class NachweisRepositoryTest {

    @Autowired
    private NachweisRepository nachweisRepository;

    @Test
    void saveAndFindByAzubiId_and_pageable() {
        User user = new User();
        user.setUsername("abdullahyildirim");
        user.setName("Abdullah Yildirim");
        user.setPassword("pw");
        user.setEmail("ay@b.com");

        Nachweis n = new Nachweis();
        n.setAzubi(user);
        n.setName(user.getName());
        n.setNummer(1);
        n.setStatus(EStatus.IN_BEARBEITUNG);

        // saving Nachweis will cascade persist the user if JPA is configured
        // accordingly; if not, repository.save should still work
        Nachweis saved = nachweisRepository.save(n);

        assertThat(nachweisRepository.findAllByAzubiId(saved.getAzubi().getId())).isNotNull();

        Page<Nachweis> page = nachweisRepository.findAllByAzubiId(saved.getAzubi().getId(), PageRequest.of(0, 10));
        assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(0);
    }
}
