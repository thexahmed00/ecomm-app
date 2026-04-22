  // src/models/PlatformSettings.ts                     
  import mongoose, { Schema, Document } from 'mongoose';
                                                                                                                                                                                                                                                                             
  export interface IPlatformSettings extends Document {
    key: 'global';                                                                                                                                                                                                                                                           
    commissionRate: number;                             
    vendorRegistrationOpen: boolean;
    maintenanceMode: boolean;                                                                                                                                                                                                                                                
    createdAt: Date;
    updatedAt: Date;                                                                                                                                                                                                                                                         
  }                                                     

  const PlatformSettingsSchema: Schema = new Schema(
    {
      key: { type: String, default: 'global', unique: true },
      commissionRate: { type: Number, default: 0.1 },                                                                                                                                                                                                                        
      vendorRegistrationOpen: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },                                                                                                                                                                                                                    
    },                                                                                                                                                                                                                                                                       
    { timestamps: true }
  );                                                                                                                                                                                                                                                                         
                                                        
  export const PlatformSettings =
    mongoose.models.PlatformSettings ||
    mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);
  export default PlatformSettings;                                                                                                                                                                                                                                           
   