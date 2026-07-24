-- Default Coordinator account (email: coordinator@seal.edu.vn / password: Coordinator@123)
-- Change this password immediately after first login in a real deployment.
INSERT INTO app_user (id, full_name, email, password_hash, user_category, account_status, guest_judge)
VALUES (
    gen_random_uuid(),
    'Ban Tổ Chức SEAL Hackathon',
    'coordinator@seal.edu.vn',
    crypt('Coordinator@123', gen_salt('bf')),
    'STAFF',
    'APPROVED',
    FALSE
);

INSERT INTO user_role_assignment (id, user_id, role_name, scope_type, scope_id)
SELECT gen_random_uuid(), id, 'COORDINATOR', 'GLOBAL', NULL
FROM app_user WHERE email = 'coordinator@seal.edu.vn';

-- Default reusable criteria template
INSERT INTO criteria_template (id, name, description, is_default)
VALUES (
    gen_random_uuid(),
    'Bộ tiêu chí mặc định SEAL Hackathon',
    'Mẫu tiêu chí chấm điểm mặc định, dùng lại được qua các sự kiện và có thể tuỳ chỉnh theo từng sự kiện/vòng.',
    TRUE
);

INSERT INTO criterion (id, template_id, name, description, weight, max_score)
SELECT gen_random_uuid(), ct.id, c.name, c.description, c.weight, 10.00
FROM criteria_template ct
CROSS JOIN (VALUES
    ('Tính sáng tạo', 'Mức độ mới mẻ và sáng tạo của ý tưởng, giải pháp', 20.00),
    ('Tính khả thi kỹ thuật', 'Chất lượng kỹ thuật, độ hoàn thiện và khả năng triển khai thực tế', 30.00),
    ('Trải nghiệm người dùng', 'Giao diện, trải nghiệm sử dụng và giá trị mang lại cho người dùng', 20.00),
    ('Thuyết trình & Demo', 'Chất lượng thuyết trình, demo sản phẩm và khả năng truyền đạt', 30.00)
) AS c(name, description, weight)
WHERE ct.is_default = TRUE;
