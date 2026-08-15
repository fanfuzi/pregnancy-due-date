# 孕产站内容发布计划

## 规则
- **发布时间**：每周五晚上 9:00
- **发布流程**：`cd /Users/linjiongyu/mypro/claudePro/stations/tools/pregnancy-due-date && bash publish.sh`
- **发布前检查**：替换文章里的 `YOUR-AMAZON-TAG`（用了 config 的话不用手动改）

## 8 周选题

### Week 1 (本周)
- [x] how-to-calculate-due-date ✅
- [x] due-date-calculator-accuracy ✅
- [x] first-trimester-checklist ✅
- [x] pregnancy-trimesters-guide ✅
- [x] what-to-pack-hospital-bag ✅
- [x] pregnancy-symptoms-by-week ✅
- [x] early-signs-of-pregnancy ✅
- [x] pregnancy-test-accuracy ✅

### Week 2
- [ ] Prenatal Vitamins: Which Ones to Take & When to Start
- [ ] Can You Get Pregnant on Your Period? Myths & Facts

### Week 3
- [ ] Second Trimester: What to Expect in Weeks 13-26
- [ ] Pregnancy Food Cravings: Why They Happen & Healthy Alternatives

### Week 4
- [ ] Third Trimester: What to Expect & Warning Signs
- [ ] How to Prepare for Labor: Physical & Mental Prep

### Week 5
- [ ] Breastfeeding vs Formula: What to Expect
- [ ] Postpartum Recovery: What to Expect in the First 6 Weeks

### Week 6
- [ ] Miscarriage: Signs, Causes & When to Call Your Doctor
- [ ] Ectopic Pregnancy: Symptoms, Risks & Treatment

### Week 7
- [ ] Pregnancy After 35: What to Know About Advanced Maternal Age
- [ ] IVF Pregnancy: What's Different About the Timeline

### Week 8
- [ ] How to Stay Comfortable During Pregnancy: Tips for Each Trimester
- [ ] Pregnancy Brain: Is Forgetfulness During Pregnancy Normal?

## 每篇文章长度要求
- 正文至少 1500 字
- 使用 H1/H2/H3 标签结构清晰
- 包含至少 2 处内部链接（指向其他文章或计算器）
- 结尾加 1 个 CTA（Call to Action）引导用户使用计算器

## 发布清单
- [ ] 文章 HTML 写好并放入 `blog/` 目录
- [ ] 在 `blog/index.html` 添加文章卡片
- [ ] 在 `sitemap.xml` 添加新 URL
- [ ] 运行 `publish.sh` 提交、推送、部署
- [ ] 去 Google Search Console 手动请求索引