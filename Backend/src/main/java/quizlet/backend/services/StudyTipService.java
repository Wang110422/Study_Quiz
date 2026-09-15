package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.dto.StudyTipDTO;
import quizlet.backend.enums.ExamType;
import quizlet.backend.enums.SkillType;
import quizlet.backend.model.Exam;
import quizlet.backend.model.StudyTip;
import quizlet.backend.repository.ExamRepository;
import quizlet.backend.repository.StudyTipRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudyTipService {

    @Autowired
    private StudyTipRepository studyTipRepository;

    @Autowired
    private ExamRepository examRepository;

    @Transactional(readOnly = true)
    public List<StudyTipDTO> getStudyTips(ExamType examType, SkillType skill) {
        List<StudyTip> tips;
        if (examType != null && skill != null) {
            tips = studyTipRepository.findByExamTypeAndSkillAndIsActiveTrueOrderByOrderIndexAsc(examType, skill);
        } else if (examType != null) {
            tips = studyTipRepository.findByExamTypeAndIsActiveTrueOrderByOrderIndexAsc(examType);
        } else if (skill != null) {
            tips = studyTipRepository.findBySkillAndIsActiveTrueOrderByOrderIndexAsc(skill);
        } else {
            tips = studyTipRepository.findByIsActiveTrueOrderByOrderIndexAsc();
        }

        List<Exam> exams = examRepository.findAll();

        return tips.stream()
                .map(tip -> mapToDTO(tip, exams))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudyTipDTO getStudyTipById(Long id) {
        StudyTip tip = studyTipRepository.findById(id).orElse(null);
        if (tip == null) return null;
        return mapToDTO(tip, examRepository.findAll());
    }

    @Transactional
    public StudyTipDTO createStudyTip(StudyTipDTO dto) {
        StudyTip tip = new StudyTip();
        tip.setExamType(dto.getExamType() != null ? dto.getExamType() : ExamType.TOEIC);
        tip.setSkill(dto.getSkill() != null ? dto.getSkill() : SkillType.LISTENING);
        tip.setPartName(dto.getPartName() != null ? dto.getPartName() : "Part 1");
        tip.setFromQuestion(dto.getFromQuestion());
        tip.setToQuestion(dto.getToQuestion());
        tip.setTitle(dto.getTitle());
        tip.setContent(dto.getContent());
        tip.setOrderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : 1);
        tip.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        StudyTip saved = studyTipRepository.save(tip);
        return mapToDTO(saved, examRepository.findAll());
    }

    @Transactional
    public StudyTipDTO updateStudyTip(Long id, StudyTipDTO dto) {
        StudyTip tip = studyTipRepository.findById(id).orElse(null);
        if (tip == null) return null;

        if (dto.getExamType() != null) tip.setExamType(dto.getExamType());
        if (dto.getSkill() != null) tip.setSkill(dto.getSkill());
        if (dto.getPartName() != null) tip.setPartName(dto.getPartName());
        if (dto.getFromQuestion() != null) tip.setFromQuestion(dto.getFromQuestion());
        if (dto.getToQuestion() != null) tip.setToQuestion(dto.getToQuestion());
        if (dto.getTitle() != null) tip.setTitle(dto.getTitle());
        if (dto.getContent() != null) tip.setContent(dto.getContent());
        if (dto.getOrderIndex() != null) tip.setOrderIndex(dto.getOrderIndex());
        if (dto.getIsActive() != null) tip.setIsActive(dto.getIsActive());

        StudyTip saved = studyTipRepository.save(tip);
        return mapToDTO(saved, examRepository.findAll());
    }

    @Transactional
    public void deleteStudyTip(Long id) {
        studyTipRepository.deleteById(id);
    }

    private StudyTipDTO mapToDTO(StudyTip tip, List<Exam> exams) {
        List<String> tipLines = new ArrayList<>();
        if (tip.getContent() != null && !tip.getContent().trim().isEmpty()) {
            tipLines = Arrays.stream(tip.getContent().split("\n"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }

        Long matchedExamId = null;
        if (exams != null && !exams.isEmpty()) {
            for (Exam e : exams) {
                if (e.getType() == tip.getExamType()) {
                    matchedExamId = e.getId();
                    break;
                }
            }
            if (matchedExamId == null) {
                matchedExamId = exams.get(0).getId();
            }
        }

        String cta = "Học mẹo " + (tip.getPartName() != null ? tip.getPartName() : "ngay");

        return StudyTipDTO.builder()
                .id(tip.getId())
                .examType(tip.getExamType())
                .skill(tip.getSkill())
                .partName(tip.getPartName())
                .fromQuestion(tip.getFromQuestion())
                .toQuestion(tip.getToQuestion())
                .title(tip.getTitle())
                .content(tip.getContent())
                .tips(tipLines)
                .orderIndex(tip.getOrderIndex())
                .isActive(tip.getIsActive())
                .examId(matchedExamId)
                .cta(cta)
                .build();
    }
}
