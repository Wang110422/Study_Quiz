package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.dto.ExamDTO;
import quizlet.backend.dto.StudyTipDTO;
import quizlet.backend.enums.ExamType;
import quizlet.backend.enums.SkillType;
import quizlet.backend.model.Exam;
import quizlet.backend.model.StudyTip;
import quizlet.backend.repository.ExamRepository;
import quizlet.backend.repository.StudyTipRepository;

import java.util.*;
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

        List<Exam> allExams = examRepository.findAll();

        return tips.stream()
                .map(tip -> mapToDTO(tip, allExams))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudyTipDTO getStudyTipById(Long id) {
        StudyTip tip = studyTipRepository.findById(id).orElse(null);
        if (tip == null) return null;
        return mapToDTO(tip, examRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<ExamDTO> getExamsByStudyTipId(Long id) {
        StudyTip tip = studyTipRepository.findById(id).orElse(null);
        if (tip == null || tip.getExams() == null) {
            return Collections.emptyList();
        }
        return tip.getExams().stream()
                .map(this::convertExamToDTO)
                .collect(Collectors.toList());
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

        // Gán danh sách đề thi nếu được truyền vào
        if (dto.getExamIds() != null && !dto.getExamIds().isEmpty()) {
            List<Exam> exams = examRepository.findAllById(dto.getExamIds());
            tip.setExams(new HashSet<>(exams));
        } else if (dto.getExamId() != null) {
            examRepository.findById(dto.getExamId()).ifPresent(exam -> tip.getExams().add(exam));
        }

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

        // Cập nhật danh sách đề thi nếu có truyền examIds
        if (dto.getExamIds() != null) {
            List<Exam> exams = examRepository.findAllById(dto.getExamIds());
            tip.setExams(new HashSet<>(exams));
        }

        StudyTip saved = studyTipRepository.save(tip);
        return mapToDTO(saved, examRepository.findAll());
    }

    @Transactional
    public StudyTipDTO addExamToStudyTip(Long tipId, Long examId) {
        StudyTip tip = studyTipRepository.findById(tipId).orElse(null);
        if (tip == null) return null;

        Exam exam = examRepository.findById(examId).orElse(null);
        if (exam == null) {
            throw new IllegalArgumentException("Không tìm thấy bài thi với ID: " + examId);
        }

        if (tip.getExams() == null) {
            tip.setExams(new HashSet<>());
        }
        tip.getExams().add(exam);

        StudyTip saved = studyTipRepository.save(tip);
        return mapToDTO(saved, examRepository.findAll());
    }

    @Transactional
    public StudyTipDTO addExamsToStudyTip(Long tipId, List<Long> examIds) {
        StudyTip tip = studyTipRepository.findById(tipId).orElse(null);
        if (tip == null) return null;

        if (examIds != null && !examIds.isEmpty()) {
            List<Exam> exams = examRepository.findAllById(examIds);
            if (tip.getExams() == null) {
                tip.setExams(new HashSet<>());
            }
            tip.getExams().addAll(exams);
        }

        StudyTip saved = studyTipRepository.save(tip);
        return mapToDTO(saved, examRepository.findAll());
    }

    @Transactional
    public StudyTipDTO removeExamFromStudyTip(Long tipId, Long examId) {
        StudyTip tip = studyTipRepository.findById(tipId).orElse(null);
        if (tip == null) return null;

        if (tip.getExams() != null) {
            tip.getExams().removeIf(exam -> exam.getId().equals(examId));
        }

        StudyTip saved = studyTipRepository.save(tip);
        return mapToDTO(saved, examRepository.findAll());
    }

    @Transactional
    public void deleteStudyTip(Long id) {
        studyTipRepository.deleteById(id);
    }

    private StudyTipDTO mapToDTO(StudyTip tip, List<Exam> allExams) {
        List<String> tipLines = new ArrayList<>();
        if (tip.getContent() != null && !tip.getContent().trim().isEmpty()) {
            tipLines = Arrays.stream(tip.getContent().split("\n"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }

        List<ExamDTO> examDTOList = new ArrayList<>();
        List<Long> tipExamIds = new ArrayList<>();
        Long matchedExamId = null;

        if (tip.getExams() != null && !tip.getExams().isEmpty()) {
            for (Exam e : tip.getExams()) {
                examDTOList.add(convertExamToDTO(e));
                tipExamIds.add(e.getId());
            }
            matchedExamId = tipExamIds.get(0);
        } else if (allExams != null && !allExams.isEmpty()) {
            for (Exam e : allExams) {
                if (e.getType() == tip.getExamType()) {
                    matchedExamId = e.getId();
                    break;
                }
            }
            if (matchedExamId == null) {
                matchedExamId = allExams.get(0).getId();
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
                .examsCount(examDTOList.size())
                .exams(examDTOList)
                .examIds(tipExamIds)
                .cta(cta)
                .build();
    }

    private ExamDTO convertExamToDTO(Exam e) {
        if (e == null) return null;
        int sCount = e.getSections() != null ? e.getSections().size() : 0;
        return ExamDTO.builder()
                .id(e.getId())
                .title(e.getTitle())
                .totalMinutes(e.getTotalMinutes())
                .totalScore(e.getTotalScore())
                .type(e.getType())
                .format(e.getFormat())
                .sectionCount(sCount)
                .build();
    }
}
