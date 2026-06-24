/**
 * Grid 栅格布局 Demo
 *
 * 展示 Row / Col 基础栅格、gutter、offset、对齐、排序、flex 与响应式布局。
 *
 * @author ChaiMingXu, 2026/06/24
 */
import React from 'react'
import {Col, getActiveBreakpoint, Grid, GroupSplitter, Row, useViewportWidth} from 'air-design'
import PageContainer from '../components/PageContainer'

const {useBreakpoint} = Grid

/** Demo 列内容块 */
const DemoBox: React.FC<{children: React.ReactNode; className?: string}> = ({children, className}) => (
  <div
    className={`rounded border border-primary/30 bg-primary/10 px-2 py-4 text-center text-sm text-foreground ${className ?? ''}`}
  >
    {children}
  </div>
)

const BreakpointIndicator: React.FC = () => {
  const screens = useBreakpoint()
  const width = useViewportWidth()
  const active = getActiveBreakpoint(width)
  const matched = Object.entries(screens)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join(' / ')

  return (
    <p className="mb-4 text-sm text-muted-foreground">
      当前断点：<code className="rounded bg-muted px-1.5 py-0.5">{active}</code>（{matched}）
    </p>
  )
}

const GridPage: React.FC = () => (
  <PageContainer
    title="Grid 栅格"
    description="24 栅格 Row / Col 布局，支持 gutter、offset、justify、align、order、flex 与 xs–xxxl 响应式，API 对齐 antd。"
  >
    <div className="demo-block">
      <GroupSplitter title="基础栅格"/>
      <Row gutter={[0, 16]}>
        <Col span={24}><DemoBox>col-24</DemoBox></Col>
      </Row>
      <Row gutter={[0, 16]}>
        <Col span={12}><DemoBox>col-12</DemoBox></Col>
        <Col span={12}><DemoBox>col-12</DemoBox></Col>
      </Row>
      <Row gutter={[0, 16]}>
        <Col span={8}><DemoBox>col-8</DemoBox></Col>
        <Col span={8}><DemoBox>col-8</DemoBox></Col>
        <Col span={8}><DemoBox>col-8</DemoBox></Col>
      </Row>
      <Row gutter={[0, 16]}>
        <Col span={6}><DemoBox>col-6</DemoBox></Col>
        <Col span={6}><DemoBox>col-6</DemoBox></Col>
        <Col span={6}><DemoBox>col-6</DemoBox></Col>
        <Col span={6}><DemoBox>col-6</DemoBox></Col>
      </Row>
    </div>

    <div className="demo-block">
      <GroupSplitter title="区块间隔 gutter"/>
      <Row gutter={16}>
        <Col span={6}><DemoBox>gutter=16</DemoBox></Col>
        <Col span={6}><DemoBox>col-6</DemoBox></Col>
        <Col span={6}><DemoBox>col-6</DemoBox></Col>
        <Col span={6}><DemoBox>col-6</DemoBox></Col>
      </Row>
      <Row gutter={[16, 24]} className="mt-4">
        <Col span={6}><DemoBox>[16, 24]</DemoBox></Col>
        <Col span={6}><DemoBox>col-6</DemoBox></Col>
        <Col span={6}><DemoBox>col-6</DemoBox></Col>
        <Col span={6}><DemoBox>col-6</DemoBox></Col>
      </Row>
    </div>

    <div className="demo-block">
      <GroupSplitter title="左右偏移 offset"/>
      <Row>
        <Col span={8}><DemoBox>col-8</DemoBox></Col>
        <Col span={8} offset={8}><DemoBox>offset=8</DemoBox></Col>
      </Row>
      <Row className="mt-4">
        <Col span={6} offset={6}><DemoBox>offset=6</DemoBox></Col>
        <Col span={6} offset={6}><DemoBox>offset=6</DemoBox></Col>
      </Row>
    </div>

    <div className="demo-block">
      <GroupSplitter title="排版 justify / 对齐 align"/>
      <Row justify="center" className="mb-4">
        <Col span={4}><DemoBox>center</DemoBox></Col>
        <Col span={4}><DemoBox>col-4</DemoBox></Col>
        <Col span={4}><DemoBox>col-4</DemoBox></Col>
      </Row>
      <Row justify="space-between" align="middle" className="bg-muted/40 py-2">
        <Col span={4}><DemoBox>space-between</DemoBox></Col>
        <Col span={4}><DemoBox className="py-6">middle</DemoBox></Col>
        <Col span={4}><DemoBox>col-4</DemoBox></Col>
      </Row>
    </div>

    <div className="demo-block">
      <GroupSplitter title="排序 order"/>
      <Row>
        <Col span={6} order={4}><DemoBox>1 order=4</DemoBox></Col>
        <Col span={6} order={3}><DemoBox>2 order=3</DemoBox></Col>
        <Col span={6} order={2}><DemoBox>3 order=2</DemoBox></Col>
        <Col span={6} order={1}><DemoBox>4 order=1</DemoBox></Col>
      </Row>
    </div>

    <div className="demo-block">
      <GroupSplitter title="Flex 填充"/>
      <Row>
        <Col flex={2}><DemoBox>flex=2</DemoBox></Col>
        <Col flex={3}><DemoBox>flex=3</DemoBox></Col>
      </Row>
      <Row className="mt-4">
        <Col flex="100px"><DemoBox>flex=100px</DemoBox></Col>
        <Col flex="auto"><DemoBox>flex=auto</DemoBox></Col>
      </Row>
    </div>

    <div className="demo-block">
      <GroupSplitter title="响应式布局"/>
      <BreakpointIndicator/>
      <Row>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <DemoBox>xs=24 sm=12 md=8 lg=6 xl=4</DemoBox>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <DemoBox>col</DemoBox>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <DemoBox>col</DemoBox>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <DemoBox>col</DemoBox>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <DemoBox>col</DemoBox>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <DemoBox>col</DemoBox>
        </Col>
      </Row>
    </div>
  </PageContainer>
)

export default GridPage
