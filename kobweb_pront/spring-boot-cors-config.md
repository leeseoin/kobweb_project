# 스프링 부트 CORS 설정 가이드

## 1. CORS 설정 클래스 생성

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://127.0.0.1:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## 2. 또는 @CrossOrigin 어노테이션 사용

```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ContactController {
    
    @GetMapping("/contacts")
    public ResponseEntity<List<Contact>> getContacts() {
        // 구현
    }
    
    @PostMapping("/contacts")
    public ResponseEntity<Contact> createContact(@RequestBody Contact contact) {
        // 구현
    }
}
```

## 3. Contact 엔티티 예시

```java
@Entity
@Table(name = "contacts")
public class Contact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String title;
    
    private String avatar;
    
    @Column(nullable = false)
    private String email;
    
    private String github;
    private String notion;
    
    @ElementCollection
    @CollectionTable(name = "contact_skills", joinColumns = @JoinColumn(name = "contact_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Getters and Setters
}
```

## 4. Contact DTO

```java
public class ContactDto {
    private Long id;
    private String name;
    private String title;
    private String avatar;
    private String email;
    private String github;
    private String notion;
    private List<String> skills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Getters and Setters
}
```

## 5. Contact Controller

```java
@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ContactController {
    
    @Autowired
    private ContactService contactService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<ContactDto>>> getAllContacts() {
        try {
            List<ContactDto> contacts = contactService.getAllContacts();
            ApiResponse<List<ContactDto>> response = new ApiResponse<>(
                contacts, "Contacts retrieved successfully", true
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<List<ContactDto>> response = new ApiResponse<>(
                null, "Failed to retrieve contacts", false
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactDto>> getContact(@PathVariable Long id) {
        try {
            ContactDto contact = contactService.getContactById(id);
            ApiResponse<ContactDto> response = new ApiResponse<>(
                contact, "Contact retrieved successfully", true
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<ContactDto> response = new ApiResponse<>(
                null, "Contact not found", false
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<ContactDto>> createContact(@RequestBody ContactDto contactDto) {
        try {
            ContactDto createdContact = contactService.createContact(contactDto);
            ApiResponse<ContactDto> response = new ApiResponse<>(
                createdContact, "Contact created successfully", true
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            ApiResponse<ContactDto> response = new ApiResponse<>(
                null, "Failed to create contact", false
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactDto>> updateContact(
            @PathVariable Long id, 
            @RequestBody ContactDto contactDto) {
        try {
            ContactDto updatedContact = contactService.updateContact(id, contactDto);
            ApiResponse<ContactDto> response = new ApiResponse<>(
                updatedContact, "Contact updated successfully", true
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<ContactDto> response = new ApiResponse<>(
                null, "Failed to update contact", false
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContact(@PathVariable Long id) {
        try {
            contactService.deleteContact(id);
            ApiResponse<Void> response = new ApiResponse<>(
                null, "Contact deleted successfully", true
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Void> response = new ApiResponse<>(
                null, "Failed to delete contact", false
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
```

## 6. ApiResponse 클래스

```java
public class ApiResponse<T> {
    private T data;
    private String message;
    private boolean success;
    
    public ApiResponse(T data, String message, boolean success) {
        this.data = data;
        this.message = message;
        this.success = success;
    }
    
    // Getters and Setters
}
```

## 7. application.properties 설정

```properties
# Server Configuration
server.port=8080

# Database Configuration (예: H2 인메모리 DB)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# H2 Console (개발용)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

## 8. 의존성 (pom.xml)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```
