import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
	class users extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	users.init({
		UUID: {
			type: DataTypes.UUID,
			type: DataTypes.UUIDV4
		},
		Discord_ID: {
			type: DataTypes.STRING,
			allowNull: false
		},
		Email: {
			type: DataTypes.STRING,
			allowNull: false
		},
		Authenticated_At: {
			type: DataTypes.DATE,
			allowNull: false
		}
	}, {
		sequelize,
		modelName: 'users',
	});
	return users;
};