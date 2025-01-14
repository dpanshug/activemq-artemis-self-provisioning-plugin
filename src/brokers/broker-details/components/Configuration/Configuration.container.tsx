import { FC, useState, useEffect } from 'react';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import { Configuration } from './Configuration.component';
import {
  AMQBrokerModel,
  K8sResourceCommon,
  getCondition,
  BrokerConditionTypes,
} from '../../../../utils';
import { Loading } from '../../../../shared-components';
import { useTranslation } from '../../../../i18n';

export type ConfigurationContainerProps = {
  namespace?: string;
  name?: string;
};

const ConfigurationContainer: FC<ConfigurationContainerProps> = ({
  name,
  namespace = 'default',
}) => {
  const { t } = useTranslation();
  const [configurationSettings, setConfigurationSettings] =
    useState<K8sResourceCommon>();
  const [loading, setLoading] = useState<boolean>(true);

  const k8sGetBroker = () => {
    setLoading(true);
    k8sGet({ model: AMQBrokerModel, name, ns: namespace })
      .then((broker: K8sResourceCommon) => {
        setConfigurationSettings(broker);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    k8sGetBroker();
  }, []);

  if (loading) return <Loading />;

  const readyCondition = configurationSettings?.status
    ? getCondition(
        configurationSettings?.status.conditions,
        BrokerConditionTypes.Ready,
      )
    : null;

  return (
    <Configuration
      name={configurationSettings?.metadata.name}
      created={configurationSettings?.metadata?.creationTimestamp}
      image={configurationSettings?.spec?.deploymentPlan.image}
      messageMigrationEnabled={
        configurationSettings?.spec?.deploymentPlan.messageMigration
          ? t('yes')
          : t('no')
      }
      persistanceEnabled={
        configurationSettings?.spec?.deploymentPlan.persistenceEnabled
          ? t('yes')
          : t('no')
      }
      size={configurationSettings?.spec?.deploymentPlan.size}
      status={
        readyCondition && readyCondition.status === 'True'
          ? t('active')
          : t('inactive')
      }
    />
  );
};

export { ConfigurationContainer };
