export interface AwsRegionInfo {
  customGroup: string,
  customGroupName?: string,
  regionSwitchAction?: () => any,
  disabled?: boolean,
  key: string,
  group: string,
  name: string,
}

export const regionGroupName = {
  'global': 'Global (All Regions)',
  'america': 'Americas, North & South',
  'europe-oceania': 'Europe & AP Oceania',
  'asia': 'Asia & Pacific Islands',
  'me-africa': 'Africa & Middle East',
};

export const defaultRegionInfo: {[regionKey: string]: AwsRegionInfo; } = {
  'global': { customGroup: 'global', key: 'global', group: 'Global', name: 'All Regions' },
  'us-east-1': { customGroup: 'america', key: 'us-east-1', group: 'US East', name: 'N. Virginia' },
  'us-east-2': { customGroup: 'america', key: 'us-east-2', group: 'US East', name: 'Ohio' },
  'us-west-1': { customGroup: 'america', key: 'us-west-1', group: 'US West', name: 'N. California' },
  'us-west-2': { customGroup: 'america', key: 'us-west-2', group: 'US West', name: 'Oregon' },
  'ca-central-1': { customGroup: 'america', key: 'ca-central-1', group: 'Canada', name: 'Central' },
  'us-gov-east-1': { customGroup: 'america', key: 'us-gov-east-1', group: 'AWS GovCloud', name: 'US-East' },
  'us-gov-west-1': { customGroup: 'america', key: 'us-gov-west-1', group: 'AWS GovCloud', name: 'US-West' },
  'sa-east-1': { customGroup: 'america', key: 'sa-east-1', group: 'South America', name: 'São Paulo' },
  'ap-northeast-1': { customGroup: 'asia', key: 'ap-northeast-1', group: 'Asia Pacific', name: 'Tokyo' },
  'ap-northeast-2': { customGroup: 'asia', key: 'ap-northeast-2', group: 'Asia Pacific', name: 'Seoul' },
  'ap-northeast-3': { customGroup: 'asia', key: 'ap-northeast-3', group: 'Asia Pacific', name: 'Osaka' },
  'ap-east-1': {  customGroup: 'asia', key: 'ap-east-1', group: 'Asia Pacific', name: 'Hong Kong' },
  'ap-southeast-1': { customGroup: 'asia', key: 'ap-southeast-1', group: 'Asia Pacific', name: 'Singapore' },
  'ap-southeast-3': { customGroup: 'asia', key: 'ap-southeast-3', group: 'Asia Pacific', name: 'Jakarta' },
  'ap-south-1': { customGroup: 'asia', key: 'ap-south-1', group: 'Asia Pacific', name: 'Mumbai' },
  'ap-south-2': { customGroup: 'asia', key: 'ap-south-2', group: 'Asia Pacific', name: 'Hyderabad' },
  'eu-north-1': { customGroup: 'europe-oceania', key: 'eu-north-1', group: 'Europe', name: 'Stockholm' },
  'eu-west-1': { customGroup: 'europe-oceania', key: 'eu-west-1', group: 'Europe', name: 'Ireland' },
  'eu-west-2': { customGroup: 'europe-oceania', key: 'eu-west-2', group: 'Europe', name: 'London' },
  'eu-west-3': { customGroup: 'europe-oceania', key: 'eu-west-3', group: 'Europe', name: 'Paris' },
  'eu-central-1': { customGroup: 'europe-oceania', key: 'eu-central-1', group: 'Europe', name: 'Frankfurt' },
  'eu-central-2': { customGroup: 'europe-oceania', key: 'eu-central-2', group: 'Europe', name: 'Zurich' },
  'eu-south-1': { customGroup: 'europe-oceania', key: 'eu-south-1', group: 'Europe', name: 'Milan' },
  'eu-south-2': { customGroup: 'europe-oceania', key: 'eu-south-2', group: 'Europe', name: 'Spain' },
  'ap-southeast-2': { customGroup: 'europe-oceania', key: 'ap-southeast-2', group: 'Asia Pacific', name: 'Sydney' },
  'ap-southeast-4': { customGroup: 'europe-oceania', key: 'ap-southeast-4', group: 'Asia Pacific', name: 'Melbourne' },
  'af-south-1': { customGroup: 'me-africa', key: 'af-south-1', group: 'Africa', name: 'Cape Town' },
  'me-central-1': { customGroup: 'me-africa', key: 'me-south-1', group: 'Middle East', name: 'Bahrain' },
  'me-south-1': { customGroup: 'me-africa', key: 'me-south-1', group: 'Middle East', name: 'UAE' },
};

export function awsRegionGetName(regionKey: string): string {
  return defaultRegionInfo[regionKey].name;
}

export function awsRegionGetFullName(regionKey: string): string {
  return `${defaultRegionInfo[regionKey].group} (${defaultRegionInfo[regionKey].name})`;
}
