// 千角灯专用拼装逻辑
class LanternAssembler {
  // 主验证函数
  static validateAssembly(part1, part2, userData1, userData2) {
    console.log('🔧 千角灯拼装验证:', part1.name, '+', part2.name);
    
    try {
      // 1. 基础检查
      const baseCheck = this.checkBasics(part1, part2);
      if (!baseCheck.success) return baseCheck;
      
      // 2. 解析连接点
      const points1 = JSON.parse(part1.connection_points || '[]');
      const points2 = JSON.parse(part2.connection_points || '[]');
      
      // 3. 计算位置误差
      const pos1 = userData1.position || {x:0, y:0, z:0};
      const pos2 = userData2.position || {x:0, y:0, z:0};
      const positionScore = this.calculatePositionScore(points1, points2, pos1, pos2);
      
      // 4. 计算角度误差
      const rot1 = userData1.rotation || {x:0, y:0, z:0};
      const rot2 = userData2.rotation || {x:0, y:0, z:0};
      const rotationScore = this.calculateRotationScore(rot1, rot2);
      
      // 5. 综合评分
      const finalScore = this.calculateFinalScore(positionScore, rotationScore, part1.difficulty);
      const accuracy = Math.round(finalScore * 100);
      const isSuccess = accuracy >= 60; // 60%以上算成功
      
      // 6. 生成详细反馈
      const message = this.generateFeedback(
        isSuccess, 
        accuracy, 
        positionScore, 
        rotationScore,
        part1.type,
        part2.type
      );
      
      return {
        success: true,
        assembled: isSuccess,
        accuracy: accuracy,
        score: Math.floor(accuracy * 10),
        message: message,
        details: {
          positionScore: Math.round(positionScore * 100),
          rotationScore: Math.round(rotationScore * 100),
          difficulty: part1.difficulty,
          connectionType: this.getConnectionType(part1.type, part2.type)
        },
        suggestions: isSuccess ? [] : this.getSuggestions(positionScore, rotationScore)
      };
      
    } catch (error) {
      console.error('拼装验证错误:', error);
      return {
        success: false,
        error: '验证过程出错',
        debug: error.message
      };
    }
  }
  
  // 基础检查
  static checkBasics(part1, part2) {
    // 类型兼容性
    const compatTypes = JSON.parse(part1.compatible_types || '[]');
    if (!compatTypes.includes(part2.type)) {
      return {
        success: true,
        assembled: false,
        message: `❌ 结构错误：${this.typeToChinese(part1.type)}不能连接${this.typeToChinese(part2.type)}`,
        accuracy: 0,
        score: 0
      };
    }
    
    // 不能自己连接自己
    if (part1.id === part2.id) {
      return {
        success: true,
        assembled: false,
        message: '❌ 不能连接同一个部件',
        accuracy: 0,
        score: 0
      };
    }
    
    return { success: true };
  }
  
  // 计算位置得分
  static calculatePositionScore(points1, points2, pos1, pos2) {
    // 计算距离
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    // 理想距离（千角灯连接特点）
    const idealDistance = 0.15;
    
    // 计算得分：距离越接近理想值得分越高
    const distanceScore = Math.max(0, 1 - Math.abs(distance - idealDistance) / idealDistance);
    
    // 如果有连接点数据，计算连接点匹配度
    let pointMatchScore = 0.5; // 默认值
    
    if (points1.length > 0 && points2.length > 0) {
      // 简单计算：连接点数量匹配度
      const pointRatio = Math.min(points1.length, points2.length) / Math.max(points1.length, points2.length, 1);
      pointMatchScore = 0.3 + pointRatio * 0.7;
    }
    
    // 综合位置得分
    return distanceScore * 0.7 + pointMatchScore * 0.3;
  }
  
  // 计算旋转得分
  static calculateRotationScore(rot1, rot2) {
    // 计算角度差异
    const angleX = Math.abs(rot2.x - rot1.x) % 360;
    const angleY = Math.abs(rot2.y - rot1.y) % 360;
    const angleZ = Math.abs(rot2.z - rot1.z) % 360;
    
    // 转换为0-1的得分
    const scoreX = 1 - Math.min(angleX, 360 - angleX) / 180;
    const scoreY = 1 - Math.min(angleY, 360 - angleY) / 180;
    const scoreZ = 1 - Math.min(angleZ, 360 - angleZ) / 180;
    
    // 千角灯主要关注Y轴旋转
    return scoreY * 0.5 + (scoreX + scoreZ) * 0.25;
  }
  
  // 计算最终得分
  static calculateFinalScore(positionScore, rotationScore, difficulty) {
    // 难度系数：难度越高，要求越精确
    const difficultyFactor = 1.0 - (difficulty - 1) * 0.1;
    
    // 综合得分
    const rawScore = positionScore * 0.6 + rotationScore * 0.4;
    
    // 应用难度系数
    return Math.min(1.0, rawScore * difficultyFactor);
  }
  
  // 生成反馈信息
  static generateFeedback(isSuccess, accuracy, posScore, rotScore, type1, type2) {
    const chineseType1 = this.typeToChinese(type1);
    const chineseType2 = this.typeToChinese(type2);
    
    if (isSuccess) {
      const praise = accuracy >= 90 ? '完美！' : accuracy >= 75 ? '优秀！' : '合格！';
      return `🎉 ${praise} ${chineseType1}与${chineseType2}连接成功（${accuracy}% 精确）`;
    } else {
      let feedback = `❌ ${chineseType1}与${chineseType2}连接需调整：`;
      
      if (posScore < 0.6) {
        feedback += ' 位置偏差较大';
        if (rotScore < 0.6) feedback += '，角度也需要调整';
      } else if (rotScore < 0.6) {
        feedback += ' 角度需要调整';
      } else {
        feedback += ' 整体精度不足';
      }
      
      return feedback + `（当前${accuracy}%，需要≥60%）`;
    }
  }
  
  // 获取改进建议
  static getSuggestions(positionScore, rotationScore) {
    const suggestions = [];
    
    if (positionScore < 0.7) {
      suggestions.push('尝试将部件移近一些');
      suggestions.push('检查连接点是否对齐');
    }
    
    if (rotationScore < 0.7) {
      suggestions.push('调整部件的旋转角度');
      suggestions.push('确保榫卯方向正确');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('轻微调整位置和角度');
    }
    
    return suggestions;
  }
  
  // 类型转中文
  static typeToChinese(type) {
    const map = {
      'frame': '骨架',
      'panel': '灯面',
      'decoration': '装饰',
      'light': '灯芯',
      'connector': '连接件'
    };
    return map[type] || type;
  }
  
  // 获取连接类型
  static getConnectionType(type1, type2) {
    const combinations = {
      'frame-panel': '骨架-灯面连接',
      'panel-decoration': '灯面-装饰连接',
      'decoration-light': '装饰-灯芯连接',
      'frame-connector': '骨架-连接件'
    };
    
    const key1 = `${type1}-${type2}`;
    const key2 = `${type2}-${type1}`;
    
    return combinations[key1] || combinations[key2] || '普通连接';
  }
}

module.exports = LanternAssembler;