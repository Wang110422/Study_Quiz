package quizlet.backend.services;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.*;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.dto.StudySetDTO;
import quizlet.backend.dto.VocabularyFlashCardDTO;
import quizlet.backend.helper.SlugUtil;
import quizlet.backend.model.User;
import quizlet.backend.repository.StudySetRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GoogleSheetService {
    private final GsonFactory jsonFactory = GsonFactory.getDefaultInstance();

    @Autowired
    private VocabularyService vocabularyService;

    @Autowired
    private StudySetRepository studySetRepository;

    @Autowired
    private StudySetService studySetService;

    @Autowired
    private quizlet.backend.repository.FolderRepository folderRepository;

    @org.springframework.beans.factory.annotation.Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String clientId;

    @org.springframework.beans.factory.annotation.Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String clientSecret;

    public GoogleCredentials getCredentials(String accessToken) {
        return getCredentials(accessToken, null);
    }

    public GoogleCredentials getCredentials(String accessToken, String refreshToken) {
        Date expirationTime = new Date(System.currentTimeMillis() + 3600 * 1000L);
        AccessToken token = new AccessToken(accessToken, expirationTime);

        if (refreshToken != null && !refreshToken.isBlank() && clientId != null && !clientId.isBlank() && clientSecret != null && !clientSecret.isBlank()) {
            return com.google.auth.oauth2.UserCredentials.newBuilder()
                    .setClientId(clientId)
                    .setClientSecret(clientSecret)
                    .setRefreshToken(refreshToken)
                    .setAccessToken(token)
                    .build();
        }

        return GoogleCredentials.create(token);
    }

    public String createGoogleSheet(String accessToken, String titleSheetName) throws Exception {
        return createGoogleSheet(accessToken, null, titleSheetName);
    }

    public String createGoogleSheet(String accessToken, String refreshToken, String titleSheetName) throws Exception {
        GoogleCredentials credentials = getCredentials(accessToken, refreshToken);

        Drive driveService = new Drive.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                jsonFactory,
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("Quizlet-App")
                .build();

        File fileMetadata = new File();
        fileMetadata.setName(titleSheetName);
        fileMetadata.setMimeType("application/vnd.google-apps.spreadsheet");

        File spreadsheetFile = driveService.files().create(fileMetadata)
                .setFields("id")
                .execute();

        return spreadsheetFile.getId();
    }

    public String findOrCreateRootFolder(Drive driveService, String emailName) throws Exception {
        String query = "mimeType = 'application/vnd.google-apps.folder' and name = '" + emailName.replace("'", "\\'") + "' and trashed = false";
        com.google.api.services.drive.model.FileList result = driveService.files().list()
                .setQ(query)
                .setFields("files(id, name)")
                .execute();

        if (result.getFiles() != null && !result.getFiles().isEmpty()) {
            return result.getFiles().get(0).getId();
        }

        File folderMetadata = new File();
        folderMetadata.setName(emailName);
        folderMetadata.setMimeType("application/vnd.google-apps.folder");

        File folder = driveService.files().create(folderMetadata)
                .setFields("id")
                .execute();
        return folder.getId();
    }

    public String findOrCreateSubFolder(Drive driveService, String rootFolderId, String subFolderName) throws Exception {
        String query = "mimeType = 'application/vnd.google-apps.folder' and name = '" + subFolderName.replace("'", "\\'") + "' and '" + rootFolderId + "' in parents and trashed = false";
        com.google.api.services.drive.model.FileList result = driveService.files().list()
                .setQ(query)
                .setFields("files(id, name)")
                .execute();

        if (result.getFiles() != null && !result.getFiles().isEmpty()) {
            return result.getFiles().get(0).getId();
        }

        File folderMetadata = new File();
        folderMetadata.setName(subFolderName);
        folderMetadata.setMimeType("application/vnd.google-apps.folder");
        folderMetadata.setParents(Collections.singletonList(rootFolderId));

        File folder = driveService.files().create(folderMetadata)
                .setFields("id")
                .execute();
        return folder.getId();
    }

    public String findOrCreateSpreadsheetInFolder(Drive driveService, String parentFolderId, String sheetTitle) throws Exception {
        String query = "mimeType = 'application/vnd.google-apps.spreadsheet' and name = '" + sheetTitle.replace("'", "\\'") + "' and '" + parentFolderId + "' in parents and trashed = false";
        com.google.api.services.drive.model.FileList result = driveService.files().list()
                .setQ(query)
                .setFields("files(id, name)")
                .execute();

        if (result.getFiles() != null && !result.getFiles().isEmpty()) {
            return result.getFiles().get(0).getId();
        }

        File sheetMetadata = new File();
        sheetMetadata.setName(sheetTitle);
        sheetMetadata.setMimeType("application/vnd.google-apps.spreadsheet");
        sheetMetadata.setParents(Collections.singletonList(parentFolderId));

        File spreadsheetFile = driveService.files().create(sheetMetadata)
                .setFields("id")
                .execute();
        return spreadsheetFile.getId();
    }

    public String createGoogleDriveFolderAndSheet(String accessToken, String folderName) throws Exception {
        return createGoogleDriveFolderAndSheet(accessToken, null, folderName);
    }

    public String createGoogleDriveFolderAndSheet(String accessToken, String refreshToken, String folderName) throws Exception {
        GoogleCredentials credentials = getCredentials(accessToken, refreshToken);

        Drive driveService = new Drive.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                jsonFactory,
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("Quizlet-App")
                .build();

        String rootFolderId = findOrCreateRootFolder(driveService, "VocaLearn_" + folderName);
        return findOrCreateSpreadsheetInFolder(driveService, rootFolderId, folderName + " - Danh sách StudySets");
    }

    public String syncUserFoldersHierarchy(String accessToken, String refreshToken, quizlet.backend.model.User user) throws Exception {
        GoogleCredentials credentials = getCredentials(accessToken, refreshToken);

        Drive driveService = new Drive.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                jsonFactory,
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("Quizlet-App")
                .build();

        // 1. Tạo hoặc lấy Root Folder mang tên Email người dùng
        String emailRootFolderName = user.getEmail() != null && !user.getEmail().isBlank() ? user.getEmail() : "VocaLearn_" + user.getId();
        String rootFolderId = findOrCreateRootFolder(driveService, emailRootFolderName);

        // 2. Lấy tất cả thư mục chưa bị xóa mềm của người dùng
        List<quizlet.backend.model.Folder> userFolders = folderRepository.findByUserIdAndIsDelFalse(user.getId());
        if (userFolders.isEmpty()) {
            // Nếu người dùng chưa có thư mục nào, lấy mặc định tất cả thư mục
            userFolders = folderRepository.findByUserId(user.getId());
        }

        for (quizlet.backend.model.Folder folder : userFolders) {
            if (folder.getIsDel() != null && folder.getIsDel()) continue;

            // 3. Trong Root Folder, tạo Thư mục con tương ứng tên Thư mục trên Web
            String subFolderId = findOrCreateSubFolder(driveService, rootFolderId, folder.getName());
            folder.setDriveFolderId(subFolderId);

            // 4. Trong Thư mục con, tạo 1 file Google Sheet duy nhất chứa các StudySets của thư mục đó
            String spreadsheetTitle = folder.getName();
            String spreadsheetId = findOrCreateSpreadsheetInFolder(driveService, subFolderId, spreadsheetTitle);
            folder.setSheetUrl("https://docs.google.com/spreadsheets/d/" + spreadsheetId);

            // 5. Cập nhật dữ liệu từ vựng vào file Sheet này
            try {
                updateGoogleSheet(accessToken, refreshToken, user.getId(), folder.getId(), spreadsheetId);
            } catch (Exception ex) {
                System.err.println("Lỗi khi cập nhật Sheet cho folder " + folder.getName() + ": " + ex.getMessage());
            }

            folderRepository.save(folder);
        }

        return "https://drive.google.com/drive/folders/" + rootFolderId;
    }

    public void writeGoogleSheet(String accessToken, List<StudySetDTO> data, String sheetId) throws Exception {
        writeGoogleSheet(accessToken, null, data, sheetId);
    }

    public void writeGoogleSheet(String accessToken, String refreshToken, List<StudySetDTO> data, String sheetId) throws Exception {
        GoogleCredentials credentials = getCredentials(accessToken, refreshToken);

        Sheets sheetsService = new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                jsonFactory,
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("Quizlet-App")
                .build();

        List<Request> requests = new ArrayList<>();
        for (StudySetDTO studySetDTO : data) {
            AddSheetRequest addSheetRequest = new AddSheetRequest()
                    .setProperties(new SheetProperties().setTitle(studySetDTO.getTitleName()));
            requests.add(new Request().setAddSheet(addSheetRequest));
        }

        if (!requests.isEmpty()) {
            BatchUpdateSpreadsheetRequest createSheetsBatch = new BatchUpdateSpreadsheetRequest()
                    .setRequests(requests);
            sheetsService.spreadsheets().batchUpdate(sheetId, createSheetsBatch).execute();
        }

        List<ValueRange> dataWrite = new ArrayList<>();
        for (StudySetDTO studySetDTO : data) {
            List<List<Object>> rows = new ArrayList<>();
            rows.add(Arrays.asList("STT", "Term", "Definition"));

            String range = getSafeSheetRange(studySetDTO.getTitleName(), "A1");
            ValueRange valueRange = new ValueRange().setRange(range)
                    .setValues(rows);
            dataWrite.add(valueRange);
        }
        BatchUpdateValuesRequest writeBatch = new BatchUpdateValuesRequest()
                .setValueInputOption("RAW")
                .setData(dataWrite);
        sheetsService.spreadsheets().values().batchUpdate(sheetId, writeBatch).execute();
    }

    private String getSafeSheetRange(String sheetTitle, String cell) {
        String escapedTitle = sheetTitle.replace("'", "''");
        return "'" + escapedTitle + "'!" + cell;
    }

    public void updateGoogleSheet(String accessToken, Long userId, String sheetId) throws Exception {
        updateGoogleSheet(accessToken, null, userId, null, sheetId);
    }

    public void updateGoogleSheet(String accessToken, Long userId, Long folderId, String sheetId) throws Exception {
        updateGoogleSheet(accessToken, null, userId, folderId, sheetId);
    }

    public void updateGoogleSheet(String accessToken, String refreshToken, Long userId, Long folderId, String sheetId) throws Exception {
        GoogleCredentials credentials = getCredentials(accessToken, refreshToken);

        Sheets sheetsService = new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                jsonFactory,
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("Quizlet-App")
                .build();

        Spreadsheet spreadsheet = sheetsService.spreadsheets().get(sheetId).execute();
        Map<String, List<VocabularyFlashCardDTO>> data;
        if (folderId != null) {
            data = vocabularyService.getVocabularyByFolderID(folderId);
        } else {
            data = vocabularyService.getVocabularyByUserID(userId);
        }

        List<String> baseSheets = new ArrayList<>();
        Map<String, Integer> baseSheetsMap = new HashMap<>();
        List<String> dataSheets = new ArrayList<>(data.keySet());

        for (Sheet sheet : spreadsheet.getSheets()) {
            String titleName = sheet.getProperties().getTitle();
            Integer id = sheet.getProperties().getSheetId();
            baseSheets.add(titleName);
            baseSheetsMap.put(titleName, id);
        }

        List<Request> batchStructureRequests = new ArrayList<>();

        // 1. Thêm các sheet mới trước
        for (String dataSheet : dataSheets) {
            if (!baseSheets.contains(dataSheet)) {
                batchStructureRequests.add(new Request().setAddSheet(new AddSheetRequest()
                        .setProperties(new SheetProperties().setTitle(dataSheet))));
            }
        }

        // 2. Xóa các sheet cũ không dùng, đảm bảo luông giữ lại ít nhất 1 sheet
        int currentSheetCount = baseSheets.size() + (int) batchStructureRequests.stream().filter(r -> r.getAddSheet() != null).count();

        for (String baseSheet : baseSheets) {
            if (!dataSheets.contains(baseSheet)) {
                if (currentSheetCount > 1) {
                    Integer idSheetDelete = baseSheetsMap.get(baseSheet);
                    batchStructureRequests.add(new Request().setDeleteSheet(new DeleteSheetRequest().setSheetId(idSheetDelete)));
                    currentSheetCount--;
                }
            }
        }

        if (!batchStructureRequests.isEmpty()) {
            BatchUpdateSpreadsheetRequest spreadsheetBatch = new BatchUpdateSpreadsheetRequest().setRequests(batchStructureRequests);
            sheetsService.spreadsheets().batchUpdate(sheetId, spreadsheetBatch).execute();
        }

        List<ValueRange> dataWrite = new ArrayList<>();
        List<String> rangeToClean = new ArrayList<>();
        for (String dataSheet : dataSheets) {
            int oldRowCount = 0;
            if (baseSheets.contains(dataSheet)) {
                try {
                    ValueRange response = sheetsService.spreadsheets().values().get(sheetId, dataSheet).execute();
                    oldRowCount = (response != null && response.getValues() != null) ? response.getValues().size() : 0;
                } catch (Exception e) {
                    System.out.println(e.getMessage());
                }
            }
            List<List<Object>> rows = new ArrayList<>();
            rows.add(Arrays.asList("STT", "Term", "Definition"));
            int stt = 1;
            for (VocabularyFlashCardDTO vocabularyFlashCardDTO : data.get(dataSheet)) {
                rows.add(Arrays.asList(stt++, vocabularyFlashCardDTO.getTerm(), vocabularyFlashCardDTO.getDefinition()));
            }
            int newRowCount = rows.size();
            dataWrite.add(new ValueRange().setRange("'" + dataSheet + "'!A1").setValues(rows));
            if (oldRowCount > 0 && newRowCount < oldRowCount) {
                rangeToClean.add("'" + dataSheet + "'!A" + (newRowCount + 1) + ":F" + oldRowCount);
            }
        }
        BatchUpdateValuesRequest writeBatch = new BatchUpdateValuesRequest().setValueInputOption("RAW").setData(dataWrite);
        sheetsService.spreadsheets().values().batchUpdate(sheetId, writeBatch).execute();
    }

    public Map<String, List<VocabularyFlashCardDTO>> readGoogleSheet(String accessToken, String sheetId) throws Exception {
        GoogleCredentials credentials = getCredentials(accessToken);

        Sheets sheetsService = new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                jsonFactory,
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("Quizlet-App")
                .build();
        Map<String, List<VocabularyFlashCardDTO>> data = new HashMap<>();
        try {
            Spreadsheet spreadsheet = sheetsService.spreadsheets().get(sheetId).execute();

            List<String> listTagSheet = spreadsheet.getSheets()
                    .stream()
                    .map(sheet -> sheet.getProperties().getTitle())
                    .filter(title -> !title.equals("Sheet1") && !title.equals("Trang tính1"))
                    .collect(Collectors.toList());

            if (listTagSheet.isEmpty()) {
                return data;
            }

            List<String> rangesToRead = listTagSheet
                    .stream()
                    .map(sheet -> "'" + sheet + "'!A:F")
                    .collect(Collectors.toList());

            BatchGetValuesResponse response = sheetsService.spreadsheets().values()
                    .batchGet(sheetId)
                    .setRanges(rangesToRead)
                    .execute();
            List<ValueRange> valueRanges = response.getValueRanges();
            for (int i = 0; i < valueRanges.size(); i++) {
                String titleName = listTagSheet.get(i);
                ValueRange valueRange = valueRanges.get(i);
                List<List<Object>> rows = valueRange.getValues();

                List<VocabularyFlashCardDTO> vocabularyFlashCardDTOList = new ArrayList<>();

                if (rows != null && rows.size() > 1) {
                    for (int j = 1; j < rows.size(); j++) {
                        List<Object> row = rows.get(j);
                        if (row == null || row.size() <= 1) continue;
                        VocabularyFlashCardDTO vocabularyFlashCardDTO = new VocabularyFlashCardDTO();
                        vocabularyFlashCardDTO.setTerm(row.size() > 1 && row.get(1) != null ? row.get(1).toString().trim() : "");
                        vocabularyFlashCardDTO.setDefinition(row.size() > 2 && row.get(2) != null ? row.get(2).toString().trim() : "");
                        vocabularyFlashCardDTOList.add(vocabularyFlashCardDTO);
                    }
                }
                data.put(titleName, vocabularyFlashCardDTOList);
            }
        } catch (Exception e) {
            System.out.println("Lỗi đọc Google Sheet: " + e.getMessage());
        }
        return data;
    }

    @Transactional
    public List<StudySetDTO> syncGoogleSheetToWeb(String sheetId, String accessToken, Long folderId, User user) throws Exception {
        // 1. Lấy dữ liệu các StudySet và từ vựng đọc được từ Sheet
        Map<String, List<VocabularyFlashCardDTO>> dataSheet = readGoogleSheet(accessToken, sheetId);

        // 2. Xóa các StudySets cũ trong Folder nếu có folderId
        if (folderId != null) {
            studySetRepository.deleteByFolderId(folderId);
            System.out.println("Đã xóa các StudySets cũ thuộc Folder ID: " + folderId);
        }

        // 3. Lặp qua từng Sheet (tương ứng với 1 StudySet), tạo mới trong DB
        for (Map.Entry<String, List<VocabularyFlashCardDTO>> entry : dataSheet.entrySet()) {
            String titleName = entry.getKey();

            StudySetDTO studySetDTO = new StudySetDTO();
            studySetDTO.setTitleName(titleName);
            studySetDTO.setFolderId(folderId);
            studySetDTO.setVocabularies(entry.getValue());

            studySetService.createStudySet(studySetDTO,user);
        }

        // 4. Trả về danh sách StudySets thuộc Folder sau khi đồng bộ
        if (folderId != null) {
            return studySetService.getAllByFolderId(folderId);
        } else {
            return new ArrayList<>();
        }
    }

}
