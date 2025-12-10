package org.example.springboot.handler;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class TokenRefreshException extends RuntimeException {
    public TokenRefreshException(String tokenJuliaNguyen, String arminNachricht) {
        super(String.format("Fehler beim Token Refresh für Token [%s]: %s", tokenJuliaNguyen, arminNachricht));
    }
}
