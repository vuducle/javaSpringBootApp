package org.example.javamusicapp.dto.audit;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.javamusicapp.dto.nachweis.AuditPageResponse;
import org.example.javamusicapp.dto.audit.RoleAuditDto;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleAuditPageWrapper {
    private AuditPageResponse<RoleAuditDto> audits;
    private List<String> sichtbareGruppen;
    private List<String> azubis;
    private List<String> ausbilder;
}
