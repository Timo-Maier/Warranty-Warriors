service AgentService @(path: '/odata/v4/agent') {
  action analyzeWarrantyClaims(query: String) returns String;
}
