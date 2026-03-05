import { Model, UUIDV4 } from "sequelize";

export default (sequelize, DataTypes) => {
	class authcodes extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	authcodes.init({
		UUID: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4
		},
		Discord_ID: {
			type: DataTypes.STRING,
			allowNull: false
		},
		Email: {
			type: DataTypes.STRING,
			allowNull: false
		},
		Code_Hash: {
			type: DataTypes.STRING,
			allowNull: false
		},
		Expiry: {
			type: DataTypes.DATE,
			allowNull: false
		}
	}, {
		sequelize,
		modelName: 'authcodes',
		name: "authcodes"
	});
	return authcodes;
};