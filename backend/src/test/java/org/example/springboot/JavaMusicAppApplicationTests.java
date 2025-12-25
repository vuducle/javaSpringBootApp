package org.example.springboot;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import org.springframework.test.annotation.DirtiesContext;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties", properties = { "app.frontend.url=http://localhost:3000" })
class JavaMusicAppApplicationTests {

    @Test
    void contextLoads() {
    }

}
