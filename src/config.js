module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DB_URL || 'postgres://resvfamigkzmxt:4da6ab812aaadff92622cb3f45c09a3d05a7102d70a4f670eeda63d3fa4b0fa9@ec2-107-20-104-234.compute-1.amazonaws.com:5432/d96psbq8l1vmm4',
  API_TOKEN: process.env.API_TOKEN || 'dummy-api-token',
}
