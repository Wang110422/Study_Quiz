package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.dto.PhaseTaskDTO;
import quizlet.backend.dto.RoadmapDTO;
import quizlet.backend.dto.RoadmapPhaseDTO;
import quizlet.backend.dto.req.CreateRoadmapRequest;
import quizlet.backend.dto.req.UpdateTaskProgressRequest;
import quizlet.backend.enums.TaskType;
import quizlet.backend.model.*;
import quizlet.backend.repository.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoadmapService {

    @Autowired
    private RoadmapRepository roadmapRepository;

    @Autowired
    private RoadmapPhaseRepository roadmapPhaseRepository;

    @Autowired
    private PhaseTaskRepository phaseTaskRepository;

    @Autowired
    private UserTaskProgressRepository userTaskProgressRepository;

    @Autowired
    private StudySetRepository studySetRepository;

    @Autowired
    private GrammarSetRepository grammarSetRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private UserStreakService userStreakService;

    public List<RoadmapDTO> getAllRoadmaps(User user) {
        List<Roadmap> roadmaps = roadmapRepository.findAllByOrderByIdAsc();
        return roadmaps.stream()
                .map(r -> enrichRoadmapDTO(r, user))
                .collect(Collectors.toList());
    }

    public RoadmapDTO getRoadmapById(Long id, User user) {
        Roadmap roadmap = roadmapRepository.findById(id).orElse(null);
        if (roadmap == null) return null;
        return enrichRoadmapDTO(roadmap, user);
    }

    @Transactional
    public Roadmap createRoadmap(CreateRoadmapRequest request) {
        Roadmap roadmap = new Roadmap();
        roadmap.setTitle(request.getTitle());
        roadmap.setTargetScore(request.getTargetScore() != null ? request.getTargetScore() : 650);
        roadmap.setTotalEstimatedDays(request.getTotalEstimatedDays() != null ? request.getTotalEstimatedDays() : 30);

        Roadmap savedRoadmap = roadmapRepository.save(roadmap);

        List<RoadmapPhase> phases = new ArrayList<>();
        if (request.getPhases() != null && !request.getPhases().isEmpty()) {
            int phaseOrder = 1;
            for (CreateRoadmapRequest.PhaseRequest phaseReq : request.getPhases()) {
                RoadmapPhase phase = new RoadmapPhase();
                phase.setRoadmap(savedRoadmap);
                phase.setTitle(phaseReq.getTitle() != null ? phaseReq.getTitle() : "Chặng " + phaseOrder);
                phase.setMinAvgScoreToPass(phaseReq.getMinAvgScoreToPass() != null ? phaseReq.getMinAvgScoreToPass() : 70.0);
                phase.setMinAccuracyRace(phaseReq.getMinAccuracyRace() != null ? phaseReq.getMinAccuracyRace() : 70.0);

                RoadmapPhase savedPhase = roadmapPhaseRepository.save(phase);

                List<PhaseTask> tasks = new ArrayList<>();
                if (phaseReq.getTasks() != null && !phaseReq.getTasks().isEmpty()) {
                    int taskOrder = 1;
                    for (CreateRoadmapRequest.TaskRequest taskReq : phaseReq.getTasks()) {
                        PhaseTask task = new PhaseTask();
                        task.setRoadmapPhase(savedPhase);
                        task.setTitle(taskReq.getTitle() != null ? taskReq.getTitle() : "Nhiệm vụ " + taskOrder);
                        task.setTaskType(taskReq.getTaskType() != null ? taskReq.getTaskType() : TaskType.VOCABULARY);
                        task.setTargetId(taskReq.getTargetId());
                        task.setOrderIndex(taskReq.getOrderIndex() != null ? taskReq.getOrderIndex() : taskOrder);

                        tasks.add(phaseTaskRepository.save(task));
                        taskOrder++;
                    }
                }
                savedPhase.setPhaseTasks(tasks);
                phases.add(savedPhase);
                phaseOrder++;
            }
        }
        savedRoadmap.setRoadmapPhases(phases);
        return savedRoadmap;
    }

    @Transactional
    public boolean deleteRoadmap(Long id) {
        if (roadmapRepository.existsById(id)) {
            roadmapRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public RoadmapPhase addPhase(Long roadmapId, CreateRoadmapRequest.PhaseRequest request) {
        Roadmap roadmap = roadmapRepository.findById(roadmapId).orElse(null);
        if (roadmap == null) return null;

        RoadmapPhase phase = new RoadmapPhase();
        phase.setRoadmap(roadmap);
        phase.setTitle(request.getTitle() != null ? request.getTitle() : "Chặng mới");
        phase.setMinAvgScoreToPass(request.getMinAvgScoreToPass() != null ? request.getMinAvgScoreToPass() : 70.0);
        phase.setMinAccuracyRace(request.getMinAccuracyRace() != null ? request.getMinAccuracyRace() : 70.0);

        RoadmapPhase savedPhase = roadmapPhaseRepository.save(phase);

        List<PhaseTask> tasks = new ArrayList<>();
        if (request.getTasks() != null && !request.getTasks().isEmpty()) {
            int taskOrder = 1;
            for (CreateRoadmapRequest.TaskRequest taskReq : request.getTasks()) {
                PhaseTask task = new PhaseTask();
                task.setRoadmapPhase(savedPhase);
                task.setTitle(taskReq.getTitle() != null ? taskReq.getTitle() : "Nhiệm vụ " + taskOrder);
                task.setTaskType(taskReq.getTaskType() != null ? taskReq.getTaskType() : TaskType.VOCABULARY);
                task.setTargetId(taskReq.getTargetId());
                task.setOrderIndex(taskReq.getOrderIndex() != null ? taskReq.getOrderIndex() : taskOrder);

                tasks.add(phaseTaskRepository.save(task));
                taskOrder++;
            }
        }
        savedPhase.setPhaseTasks(tasks);
        return savedPhase;
    }

    @Transactional
    public boolean deletePhase(Long phaseId) {
        if (roadmapPhaseRepository.existsById(phaseId)) {
            roadmapPhaseRepository.deleteById(phaseId);
            return true;
        }
        return false;
    }

    @Transactional
    public PhaseTask addTask(Long phaseId, CreateRoadmapRequest.TaskRequest request) {
        RoadmapPhase phase = roadmapPhaseRepository.findById(phaseId).orElse(null);
        if (phase == null) return null;

        List<PhaseTask> existingTasks = phaseTaskRepository.findByRoadmapPhaseIdOrderByOrderIndexAsc(phaseId);
        int nextOrder = existingTasks.isEmpty() ? 1 : existingTasks.get(existingTasks.size() - 1).getOrderIndex() + 1;

        PhaseTask task = new PhaseTask();
        task.setRoadmapPhase(phase);
        task.setTitle(request.getTitle() != null ? request.getTitle() : "Nhiệm vụ " + nextOrder);
        task.setTaskType(request.getTaskType() != null ? request.getTaskType() : TaskType.VOCABULARY);
        task.setTargetId(request.getTargetId());
        task.setOrderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : nextOrder);

        return phaseTaskRepository.save(task);
    }

    @Transactional
    public boolean deleteTask(Long taskId) {
        if (phaseTaskRepository.existsById(taskId)) {
            phaseTaskRepository.deleteById(taskId);
            return true;
        }
        return false;
    }

    @Transactional
    public UserTaskProgress updateTaskProgress(Long taskId, User user, UpdateTaskProgressRequest request) {
        if (user == null) return null;
        PhaseTask task = phaseTaskRepository.findById(taskId).orElse(null);
        if (task == null) return null;

        UserTaskProgress progress = userTaskProgressRepository.findByUserIdAndPhaseTaskId(user.getId(), taskId)
                .orElseGet(() -> {
                    UserTaskProgress p = new UserTaskProgress();
                    p.setUser(user);
                    p.setPhaseTask(task);
                    p.setIsCompleted(false);
                    return p;
                });

        if (request.getScore() != null) {
            progress.setScore(request.getScore());
        }

        if (request.getIsCompleted() != null) {
            progress.setIsCompleted(request.getIsCompleted());
            if (Boolean.TRUE.equals(request.getIsCompleted())) {
                progress.setCompletedAt(LocalDate.now());
            }
        } else if ("COMPLETE".equalsIgnoreCase(request.getMode()) || "TEST".equalsIgnoreCase(request.getMode())) {
            progress.setIsCompleted(true);
            progress.setCompletedAt(LocalDate.now());
        }

        UserTaskProgress saved = userTaskProgressRepository.save(progress);

        // Tự động ghi nhận hoạt động học và tăng streak của ngày hôm nay
        if (userStreakService != null) {
            try {
                userStreakService.recordActivity(user);
            } catch (Exception ignored) {}
        }

        return saved;
    }

    public UserTaskProgress getTaskProgress(Long taskId, User user) {
        if (user == null) return null;
        return userTaskProgressRepository.findByUserIdAndPhaseTaskId(user.getId(), taskId).orElse(null);
    }

    private RoadmapDTO enrichRoadmapDTO(Roadmap roadmap, User user) {
        List<RoadmapPhase> rawPhases = roadmapPhaseRepository.findByRoadmapIdOrderByIdAsc(roadmap.getId());

        // Lấy toàn bộ tiến độ của user cho roadmap này
        Map<Long, UserTaskProgress> progressMap = new HashMap<>();
        if (user != null) {
            List<UserTaskProgress> userProgressList = userTaskProgressRepository
                    .findByUserIdAndPhaseTaskRoadmapPhaseRoadmapId(user.getId(), roadmap.getId());
            for (UserTaskProgress utp : userProgressList) {
                if (utp.getPhaseTask() != null) {
                    progressMap.put(utp.getPhaseTask().getId(), utp);
                }
            }
        }

        List<RoadmapPhaseDTO> phaseDTOs = new ArrayList<>();
        int totalTasksInRoadmap = 0;
        int completedTasksInRoadmap = 0;
        boolean hasFoundCurrentTask = false;
        Long currentPhaseId = null;
        Long currentTaskId = null;

        int phaseOrder = 1;
        boolean previousPhaseCompleted = true; // Chặng 1 luôn mở khóa

        for (RoadmapPhase phase : rawPhases) {
            List<PhaseTask> rawTasks = phaseTaskRepository.findByRoadmapPhaseIdOrderByOrderIndexAsc(phase.getId());
            List<PhaseTaskDTO> taskDTOs = new ArrayList<>();
            int completedTasksInPhase = 0;

            for (PhaseTask task : rawTasks) {
                totalTasksInRoadmap++;
                UserTaskProgress utp = progressMap.get(task.getId());
                boolean isDone = utp != null && Boolean.TRUE.equals(utp.getIsCompleted());

                if (isDone) {
                    completedTasksInPhase++;
                    completedTasksInRoadmap++;
                }

                String status;
                if (isDone) {
                    status = "done";
                } else if (!hasFoundCurrentTask && previousPhaseCompleted) {
                    status = "current";
                    hasFoundCurrentTask = true;
                    currentPhaseId = phase.getId();
                    currentTaskId = task.getId();
                } else {
                    status = "locked";
                }

                // Lookup target details (study set, grammar set, exam)
                String targetTitle = null;
                String targetSlug = null;
                Integer targetItemCount = null;
                String link = "/lessons";

                if (task.getTargetId() != null) {
                    if (task.getTaskType() == TaskType.VOCABULARY) {
                        StudySet ss = studySetRepository.findById(task.getTargetId()).orElse(null);
                        if (ss != null) {
                            targetTitle = ss.getTitleName();
                            targetSlug = ss.getSlug();
                            targetItemCount = ss.getVocabularies() != null ? ss.getVocabularies().size() : 0;
                            link = "/studyset/" + ss.getSlug();
                        }
                    } else if (task.getTaskType() == TaskType.GRAMMAR) {
                        GrammarSet gs = grammarSetRepository.findById(task.getTargetId()).orElse(null);
                        if (gs != null) {
                            targetTitle = gs.getTilte();
                            targetSlug = gs.getSlug();
                            targetItemCount = gs.getGrammars() != null ? gs.getGrammars().size() : 0;
                            link = "/lessons";
                        }
                    } else if (task.getTaskType() == TaskType.PRACTICE_QUESTION) {
                        Exam ex = examRepository.findById(task.getTargetId()).orElse(null);
                        if (ex != null) {
                            targetTitle = ex.getTitle();
                            link = "/exams/" + ex.getId() + "/practice";
                        } else {
                            link = "/exams";
                        }
                    } else if (task.getTaskType() == TaskType.FULL_EXAM) {
                        Exam ex = examRepository.findById(task.getTargetId()).orElse(null);
                        if (ex != null) {
                            targetTitle = ex.getTitle();
                            link = "/mock-test/" + ex.getId() + "/overview";
                        } else {
                            link = "/mock-test";
                        }
                    }
                }

                taskDTOs.add(PhaseTaskDTO.builder()
                        .id(task.getId())
                        .title(task.getTitle())
                        .taskType(task.getTaskType())
                        .targetId(task.getTargetId())
                        .orderIndex(task.getOrderIndex())
                        .status(status)
                        .isCompleted(isDone)
                        .score(utp != null ? utp.getScore() : null)
                        .targetTitle(targetTitle)
                        .targetSlug(targetSlug)
                        .targetItemCount(targetItemCount)
                        .link(link)
                        .build());
            }

            boolean isPhaseDone = !rawTasks.isEmpty() && completedTasksInPhase >= rawTasks.size();
            boolean isPhaseLocked = !previousPhaseCompleted;

            phaseDTOs.add(RoadmapPhaseDTO.builder()
                    .id(phase.getId())
                    .title(phase.getTitle())
                    .minAvgScoreToPass(phase.getMinAvgScoreToPass())
                    .minAccuracyRace(phase.getMinAccuracyRace())
                    .phaseOrder(phaseOrder)
                    .tasks(taskDTOs)
                    .totalTasks(rawTasks.size())
                    .completedTasks(completedTasksInPhase)
                    .isCompleted(isPhaseDone)
                    .isLocked(isPhaseLocked)
                    .build());

            previousPhaseCompleted = isPhaseDone;
            phaseOrder++;
        }

        int progressPercent = totalTasksInRoadmap > 0
                ? (int) Math.round(((double) completedTasksInRoadmap / totalTasksInRoadmap) * 100)
                : 0;

        boolean isRoadmapCompleted = totalTasksInRoadmap > 0 && completedTasksInRoadmap >= totalTasksInRoadmap;

        if (currentPhaseId == null && !rawPhases.isEmpty()) {
            currentPhaseId = rawPhases.get(0).getId();
        }

        return RoadmapDTO.builder()
                .id(roadmap.getId())
                .title(roadmap.getTitle())
                .targetScore(roadmap.getTargetScore())
                .totalEstimatedDays(roadmap.getTotalEstimatedDays())
                .phases(phaseDTOs)
                .totalTasks(totalTasksInRoadmap)
                .completedTasks(completedTasksInRoadmap)
                .progressPercent(progressPercent)
                .isCompleted(isRoadmapCompleted)
                .currentPhaseId(currentPhaseId)
                .currentTaskId(currentTaskId)
                .build();
    }
}
