# AirMachine

## 项目目标

AirMachine 是一个**企业级智能中台**，作为 AI 能力基础设施为各类应用提供统一的 AI 服务。

核心目标：
- **模型调用** - 统一的大模型调用网关，屏蔽不同模型供应商的接口差异
- **智能体调度** - 可编排、可调度的智能体运行平台
- **知识库检索** - 企业知识管理和智能检索
- **工作流编排** - 可视化的 AI 工作流编排
- **内容采集** - 网页抓取、内容提取、格式转换

**核心价值**：让业务系统通过 API 调用即可获得 AI 能力，无需重复建设。

## 技术栈

### 后端 (Java)
- Java 21 + Spring Boot 4.1.0-M2
- Spring AI 2.0.0-M2 (AI 集成)
- MyBatis 3.5.19 (ORM)
- PostgreSQL 18 (数据库)
- Redis/Jedis 7.2.1 (缓存/队列)
- Qdrant 1.16.2 (向量数据库)
- ZooKeeper 3.9.4 (服务注册)

### 前端
- React 18 + UmiJS Max 4
- TypeScript 5
- Ant Design 5
- Tiptap (富文本)
- Excalidraw (白板)
- Monaco Editor (代码编辑)
- XYFlow (流程图)

## 技术开发规范

1、始终使用中文回答问题
2、生成的代码中添加详细的注释，便于用户阅读理解；在class、interface等模块定义前的注释中，详细说明此代码文件的用途和设计思路。
3、第一次对话先查看目录，了解项目情况
4、采用“关注点分离”的原则设计架构，专注于解决具体问题，不要随意扩大代码修改的范围
5、解决明确提出的问题，如果发现关联问题需要解决，不要直接修改代码，首先给出方案，待用户确认后实施
6、不要生成单元测试代码、不要创建使用范例代码；如需生成test代码对已有功能进行验证，必须在验证结束后删除测试代码
7、所生成的方法的功能描述使用注释添加到代码文件中
8、所有注释为纯文本格式，注释内容中禁止使用<p>标签
9、创建单独的说明文档，描述架构设计和实现思路，修改问题需要同步修改对应的文档描述。但是禁止创建描述修复过程的Markdown说明文件
10、代码优化后，使用@Deprecated注解标记不需要的旧代码，便于后续删除
11、所有架构设计、功能实现、代码的生成等操作，参考行业最佳实现，给出合理可行且经过考验的解决方案
12、生成数据库DDL时，不要创建外键，数据应该在程序中进行关联，不要使用数据库主外键实现
13、在类文件的注释中，作者姓名为：ChaiMingXu，创建时间为当天的日期
14、完成修改后不要进行总结


- [后端开发规范](docs/rules/backend-guide.md) - Java/Spring Boot 代码规范
- [前端开发规范](docs/rules/frontend-guide.md) - React/TypeScript 代码规范


## 业务开发规范
- 所有模块的业务相关规范保存在docs/spec中
- 任何代码修改都要到docs/spec中查找对应文档，了解需求和设计，在修改结束后如有必要，更新文档

## 注意事项
- git提交时不要添加 Co-Authored-By 内容

### 快速参考

**Java 代码**：
- 包名: `com.norlandsoft.air`
- 统一响应: `ActionResponse<T>`
- 日志注解: `@Slf4j`

**前端代码**：
- 框架: UmiJS + DVA
- UI: Ant Design 5
- 样式: Less + CSS Modules (`air-` 前缀)

**参考代码**
- 项目根目录中machine文件夹中的代码是原始版本的后端实现代码
- 在后端开发时参考原始代码，部分功能可以直接拷贝

## 常用命令

```bash
# 构建项目
mvn clean install -DskipTests

# 启动基础设施
cd docker && docker-compose up -d

# 启动核心服务
./startup-platform.sh

# 启动网关
./startup-gateway.sh

# 启动前端
cd frontend && npm run start
```
