package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Ranking;
import com.seal.hackathon.repository.RankingRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class ReportExportService {

    private final RankingRepository rankingRepository;

    public ReportExportService(RankingRepository rankingRepository) {
        this.rankingRepository = rankingRepository;
    }

    @Transactional(readOnly = true)
    public byte[] exportRankingExcel(UUID roundId) {
        List<Ranking> rankings = rankingRepository.findByRoundIdOrderByRankOverallAsc(roundId);

        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFSheet sheet = workbook.createSheet("Ranking");
            String[] headers = {"Hạng tổng", "Hạng hạng mục", "Đội thi", "Hạng mục", "Điểm tổng có trọng số", "Thăng vòng"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            int rowIdx = 1;
            for (Ranking r : rankings) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(r.getRankOverall() == null ? 0 : r.getRankOverall());
                row.createCell(1).setCellValue(r.getRankInTrack() == null ? 0 : r.getRankInTrack());
                row.createCell(2).setCellValue(r.getTeam().getName());
                row.createCell(3).setCellValue(r.getTeam().getTrack() == null ? "" : r.getTeam().getTrack().getName());
                row.createCell(4).setCellValue(r.getTotalWeightedScore().doubleValue());
                row.createCell(5).setCellValue(r.isPromoted() ? "Có" : "Không");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Không thể tạo file Excel", e);
        }
    }
}
