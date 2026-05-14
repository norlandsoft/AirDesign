import React from 'react';
import {connect} from 'umi';
import KanbanPage from './views/KanbanPage';
import './index.less';

/**
 * 智能工作室 - 任务看板页面
 *
 * 第一层为 PlanSession 列表，选中 Session 后看板仅显示该 Session 的任务。
 * 布局结构：整体左中右三栏，无顶部标题区域。
 *
 * Created by ChaiMingXu, on 2026-02-10
 */
interface StudioKanbanProps {
  frameSize: { width: number; height: number };
  dispatch: (arg: any) => void;
}

const StudioKanban: React.FC<StudioKanbanProps> = (props) => {
  const {frameSize, dispatch} = props;

  return (
      <div
          className="studio-kanban"
          style={{width: frameSize.width, height: frameSize.height}}
      >
        <KanbanPage
            width={frameSize.width}
            height={frameSize.height}
        />
      </div>
  );
};

export default connect()(StudioKanban);
