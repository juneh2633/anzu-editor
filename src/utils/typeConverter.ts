export function getTypeCode(type: string): string {
  switch (type) {
    case 'NOV':
      return 'novice';
    case 'ADV':
      return 'advanced';
    case 'EXH':
      return 'exhaust';
    case 'MXM':
      return 'maximum';
    case 'INF':
      return 'infinite';
    case 'GRV':
      return 'gravity';
    case 'HVN':
      return 'heavenly';
    case 'VVD':
      return 'vivid';
    case 'EXD':
      return 'exceed';
    case 'ULT':
      return 'ultimate';
    default:
      throw new Error(`Unknown chart type: ${type}`);
  }
}

export function getTypeCodeReverse(type: string): string {
  switch (type) {
    case 'novice':
      return 'NOV';
    case 'advanced':
      return 'ADV';
    case 'exhaust':
      return 'EXH';
    case 'maximum':
      return 'MXM';
    case 'infinite':
      return 'INF';
    case 'gravity':
      return 'GRV';
    case 'heavenly':
      return 'HVN';
    case 'vivid':
      return 'VVD';
    case 'exceed':
      return 'EXD';
    case 'ultimate':
      return 'ULT';
    default:
      throw new Error(`Unknown chart type: ${type}`);
  }
}
