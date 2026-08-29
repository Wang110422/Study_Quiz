package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.dto.req.CreatePathRequest;
import quizlet.backend.model.StudyPath;
import quizlet.backend.model.StudyPathItem;
import quizlet.backend.model.StudySet;
import quizlet.backend.model.User;
import quizlet.backend.repository.StudyPathItemRepository;
import quizlet.backend.repository.StudyPathRepository;
import quizlet.backend.repository.StudySetRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class StudyPathService {

    @Autowired
    private StudyPathRepository studyPathRepository;

    @Autowired
    private StudyPathItemRepository studyPathItemRepository;

    @Autowired
    private StudySetRepository studySetRepository;

    public List<StudyPath> getUserPaths(Long userId) {
        return studyPathRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public StudyPath getPathById(Long id) {
        return studyPathRepository.findById(id).orElse(null);
    }

    public StudyPathItem getItemById(Long itemId) {
        return studyPathItemRepository.findById(itemId).orElse(null);
    }

    @Transactional
    public StudyPath createPath(User user, CreatePathRequest request) {
        StudyPath path = new StudyPath();
        path.setUser(user);
        path.setTitle(request.getTitle());
        path.setDescription(request.getDescription());
        path.setLevel(request.getLevel() != null ? request.getLevel() : "Trung bình");
        path.setDurationDays(request.getDurationDays() != null ? request.getDurationDays() : 30);
        path.setIcon(request.getIcon() != null ? request.getIcon() : "🎓");

        StudyPath savedPath = studyPathRepository.save(path);

        List<StudyPathItem> items = new ArrayList<>();
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            int order = 1;
            for (CreatePathRequest.ItemRequest itemReq : request.getItems()) {
                StudyPathItem item = new StudyPathItem();
                item.setStudyPath(savedPath);
                item.setStepOrder(order);
                item.setTitle(itemReq.getTitle() != null ? itemReq.getTitle() : "Mốc " + order);
                item.setTargetLearnCount(itemReq.getTargetLearnCount() != null ? itemReq.getTargetLearnCount() : 1);
                item.setTargetTestCount(itemReq.getTargetTestCount() != null ? itemReq.getTargetTestCount() : 3);
                item.setCompletedLearnCount(0);
                item.setCompletedTestCount(0);
                item.setIsCompleted(false);
                item.setIsLocked(order > 1); // Mốc đầu tiên không khóa, các mốc sau khóa cho tới khi mốc trước hoàn thành

                if (itemReq.getStudySetId() != null) {
                    StudySet set = studySetRepository.findById(itemReq.getStudySetId()).orElse(null);
                    item.setStudySet(set);
                    if (item.getTitle() == null || item.getTitle().isEmpty()) {
                        item.setTitle(set != null ? set.getTitleName() : "Mốc " + order);
                    }
                }

                items.add(studyPathItemRepository.save(item));
                order++;
            }
        }
        savedPath.setItems(items);
        return savedPath;
    }

    @Transactional
    public StudyPathItem updateItemProgress(Long itemId, String mode) {
        StudyPathItem item = studyPathItemRepository.findById(itemId).orElse(null);
        if (item == null) return null;

        if ("LEARN".equalsIgnoreCase(mode)) {
            item.setCompletedLearnCount(item.getCompletedLearnCount() + 1);
        } else if ("TEST".equalsIgnoreCase(mode)) {
            item.setCompletedTestCount(item.getCompletedTestCount() + 1);
        }

        // Kiểm tra xem đã đạt target hoàn thành mốc này chưa
        boolean learnDone = item.getCompletedLearnCount() >= item.getTargetLearnCount();
        boolean testDone = item.getCompletedTestCount() >= item.getTargetTestCount();

        if (learnDone && testDone) {
            item.setIsCompleted(true);

            // Mở khóa mốc tiếp theo trong lộ trình (nếu có)
            List<StudyPathItem> allItems = studyPathItemRepository.findByStudyPathIdOrderByStepOrderAsc(item.getStudyPath().getId());
            for (int i = 0; i < allItems.size(); i++) {
                if (allItems.get(i).getId().equals(item.getId()) && i + 1 < allItems.size()) {
                    StudyPathItem nextItem = allItems.get(i + 1);
                    nextItem.setIsLocked(false);
                    studyPathItemRepository.save(nextItem);
                    break;
                }
            }
        }

        return studyPathItemRepository.save(item);
    }

    public boolean deletePath(Long pathId, Long userId) {
        StudyPath path = studyPathRepository.findById(pathId).orElse(null);
        if (path != null && path.getUser().getId().equals(userId)) {
            studyPathRepository.delete(path);
            return true;
        }
        return false;
    }
}
