package com.seal.hackathon.exception;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.context.request.WebRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleGeneric_shouldNotLeakInternalExceptionMessageToClient() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/api/test");
        Exception internal = new RuntimeException("column \"secret_column\" of relation \"app_user\" does not exist");

        var response = handler.handleGeneric(internal, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().get("message").toString())
                .doesNotContain("secret_column", "app_user")
                .isEqualTo("Đã xảy ra lỗi, vui lòng thử lại sau");
    }

    @Test
    void handleDataIntegrityViolation_shouldReturnConflictWithGenericMessage() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/api/test");
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "duplicate key value violates unique constraint \"app_user_email_key\"");

        var response = handler.handleDataIntegrityViolation(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody().get("message").toString())
                .doesNotContain("app_user_email_key");
    }

    @Test
    void handleApiException_shouldReturnItsOwnStatusAndMessage() {
        ApiException ex = ApiException.notFound("Không tìm thấy người dùng");

        var response = handler.handleApiException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().get("message")).isEqualTo("Không tìm thấy người dùng");
    }
}
