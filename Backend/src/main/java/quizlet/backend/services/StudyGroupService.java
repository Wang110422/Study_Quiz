package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import quizlet.backend.dto.FolderDTO;
import quizlet.backend.dto.StudyGroupDTO;
import quizlet.backend.dto.StudySetDTO;
import quizlet.backend.dto.UserDTO;
import quizlet.backend.model.Folder;
import quizlet.backend.model.StudyGroup;
import quizlet.backend.model.StudySet;
import quizlet.backend.model.User;
import quizlet.backend.repository.FolderRepository;
import quizlet.backend.repository.StudyGroupRepository;
import quizlet.backend.repository.StudySetRepository;
import quizlet.backend.repository.UserRepository;

import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudyGroupService {

    @Autowired
    private StudyGroupRepository studyGroupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudySetRepository studySetRepository;

    @Autowired
    private FolderRepository folderRepository;

    // 1. Sinh viên tạo nhóm học mới
    public StudyGroupDTO createGroup(User student, StudyGroupDTO dto) {
        StudyGroup group = new StudyGroup();
        group.setName(dto.getName());
        group.setDescription(dto.getDescription());
        group.setJoinCode("GRP-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        group.setCreator(student);
        group.getMembers().add(student);

        StudyGroup saved = studyGroupRepository.save(group);
        return convertToDTO(saved);
    }

    // 2. Sinh viên sửa nhóm học
    public StudyGroupDTO updateGroup(User student, Long groupId, StudyGroupDTO dto) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học"));

        if (!group.getCreator().getId().equals(student.getId())) {
            throw new RuntimeException("Chỉ người tạo nhóm mới có quyền chỉnh sửa");
        }

        if (dto.getName() != null) group.setName(dto.getName());
        if (dto.getDescription() != null) group.setDescription(dto.getDescription());

        StudyGroup saved = studyGroupRepository.save(group);
        return convertToDTO(saved);
    }

    // 3. Sinh viên xóa nhóm học
    public void deleteGroup(User student, Long groupId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học"));

        if (!group.getCreator().getId().equals(student.getId())) {
            throw new RuntimeException("Chỉ người tạo nhóm mới có quyền xóa nhóm");
        }

        group.setIsDel(true);
        studyGroupRepository.save(group);
    }

    // 4. Sinh viên thêm Bộ từ vựng vào nhóm học
    public StudyGroupDTO addStudySetToGroup(User student, Long groupId, Long studySetId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học"));

        StudySet studySet = studySetRepository.findById(studySetId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bộ từ vựng"));

        group.getStudySets().add(studySet);
        StudyGroup saved = studyGroupRepository.save(group);
        return convertToDTO(saved);
    }

    // 5. Sinh viên thêm Thư mục vào nhóm học
    public StudyGroupDTO addFolderToGroup(User student, Long groupId, Long folderId) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học"));

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thư mục"));

        group.getFolders().add(folder);
        StudyGroup saved = studyGroupRepository.save(group);
        return convertToDTO(saved);
    }

    // 6. Sinh viên khác tham gia nhóm học bằng mã/đường link (joinCode)
    public StudyGroupDTO joinGroupByCode(User student, String joinCode) {
        StudyGroup group = studyGroupRepository.findByJoinCodeAndIsDelFalse(joinCode.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Mã tham gia nhóm học không hợp lệ hoặc đã hết hạn"));

        group.getMembers().add(student);
        StudyGroup saved = studyGroupRepository.save(group);
        return convertToDTO(saved);
    }

    // 7. Lấy danh sách nhóm học của sinh viên
    public List<StudyGroupDTO> getUserGroups(User user) {
        List<StudyGroup> groups = studyGroupRepository.findByMembers_IdAndIsDelFalse(user.getId());
        return groups.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // 8. Lấy chi tiết nhóm học theo ID
    public StudyGroupDTO getGroupById(Long groupId) {
        StudyGroup g = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học"));
        return convertToDTO(g);
    }

    private StudyGroupDTO convertToDTO(StudyGroup g) {
        StudyGroupDTO dto = new StudyGroupDTO();
        dto.setId(g.getId());
        dto.setName(g.getName());
        dto.setDescription(g.getDescription());
        dto.setJoinCode(g.getJoinCode());
        dto.setCreatedAt(g.getCreatedAt());
        dto.setCreatorId(g.getCreator().getId());
        dto.setCreatorName(g.getCreator().getFirstName() + " " + g.getCreator().getLastName());
        dto.setCreatorEmail(g.getCreator().getEmail());
        dto.setMembersCount(g.getMembers() != null ? g.getMembers().size() : 0);
        dto.setSetsCount(g.getStudySets() != null ? g.getStudySets().size() : 0);
        dto.setFoldersCount(g.getFolders() != null ? g.getFolders().size() : 0);

        if (g.getMembers() != null) {
            dto.setMembers(g.getMembers().stream().map(u -> {
                UserDTO udto = new UserDTO();
                udto.setId(u.getId());
                udto.setFirstName(u.getFirstName());
                udto.setLastName(u.getLastName());
                udto.setEmail(u.getEmail());
                udto.setRole(u.getRole());
                return udto;
            }).collect(Collectors.toList()));
        }

        if (g.getFolders() != null) {
            dto.setFolders(g.getFolders().stream().map(f -> {
                FolderDTO fdto = new FolderDTO();
                fdto.setId(f.getId());
                fdto.setName(f.getName());
                fdto.setDescription(f.getDescription());
                fdto.setIcon(f.getIcon());
                fdto.setSlug(f.getSlug());
                fdto.setSetsCount(f.getStudySets() != null ? f.getStudySets().size() : 0);
                return fdto;
            }).collect(Collectors.toList()));
        }

        if (g.getStudySets() != null) {
            dto.setStudySets(g.getStudySets().stream().map(s -> {
                StudySetDTO sdto = new StudySetDTO();
                sdto.setId(s.getId());
                sdto.setTitleName(s.getTitleName());
                sdto.setDescription(s.getDescription());
                sdto.setSlug(s.getSlug());
                if (s.getFolder() != null) {
                    sdto.setFolderSlug(s.getFolder().getSlug());
                }
                return sdto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
